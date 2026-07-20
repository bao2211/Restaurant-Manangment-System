import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

const PAYMENT_POLL_INTERVAL = 5000;
const PAYMENT_TIMEOUT = 10 * 60 * 1000;

export default function PayOSCheckoutScreen({ route, navigation }) {
  const { orderId, checkoutUrl, orderCode, amount, buyerName, onSuccess, onCancel } = route.params || {};
  const [status, setStatus] = useState('waiting');
  const [elapsed, setElapsed] = useState(0);
  const [webViewError, setWebViewError] = useState(false);
  const pollRef = useRef(null);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    console.log('[PayOS Screen] Mounted. checkoutUrl:', checkoutUrl, 'orderCode:', orderCode, 'amount:', amount);
    if (checkoutUrl) {
      openInBrowser();
    }
    startPolling();
    return () => stopPolling();
  }, []);

  const openInBrowser = async () => {
    try {
      console.log('[PayOS Screen] Opening URL:', checkoutUrl);
      if (Platform.OS === 'web') {
        window.open(checkoutUrl, '_blank');
      } else {
        const canOpen = await Linking.canOpenURL(checkoutUrl);
        console.log('[PayOS Screen] Can open URL:', canOpen);
        if (canOpen) {
          await Linking.openURL(checkoutUrl);
          console.log('[PayOS Screen] URL opened successfully');
        } else {
          console.log('[PayOS Screen] Cannot open URL, trying anyway...');
          await Linking.openURL(checkoutUrl);
        }
      }
    } catch (error) {
      console.error('[PayOS Screen] Error opening URL:', error);
      setWebViewError(true);
    }
  };

  const startPolling = () => {
    console.log('[PayOS Screen] Starting payment polling...');
    pollRef.current = setInterval(async () => {
      try {
        const now = Date.now();
        setElapsed(Math.floor((now - startTimeRef.current) / 1000));

        console.log('[PayOS Screen] Polling status for orderCode:', orderCode);
        const result = await apiService.getPayOSPaymentStatus(orderCode);
        console.log('[PayOS Screen] Poll result:', JSON.stringify(result));

        if (result.status === 'PAID') {
          stopPolling();
          setStatus('paid');
          await handlePaymentSuccess();
        } else if (result.status === 'CANCELLED' || result.status === 'EXPIRED') {
          stopPolling();
          setStatus('cancelled');
          handlePaymentCancelled(result.status);
        }
      } catch (error) {
        console.error('[PayOS Screen] Poll error:', error.message);
      }
    }, PAYMENT_POLL_INTERVAL);

    timeoutRef.current = setTimeout(() => {
      stopPolling();
      if (status === 'waiting') {
        setStatus('timeout');
        Alert.alert('Hết thời gian', 'Phiên thanh toán đã hết hạn.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    }, PAYMENT_TIMEOUT);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      console.log('[PayOS Screen] Confirming payment...');
      await apiService.confirmPayOSPayment(orderCode, orderId);
      console.log('[PayOS Screen] Payment confirmed');
    } catch (error) {
      console.error('[PayOS Screen] Confirm error:', error);
    }
    if (onSuccess) onSuccess(orderCode);
    Alert.alert('Thành công', 'Thanh toán thành công!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handlePaymentCancelled = (paymentStatus) => {
    if (onCancel) onCancel(paymentStatus);
    Alert.alert(
      paymentStatus === 'CANCELLED' ? 'Đã hủy' : 'Hết hạn',
      paymentStatus === 'CANCELLED' ? 'Bạn đã hủy thanh toán.' : 'Phiên thanh toán đã hết hạn.',
      [
        { text: 'Thử lại', onPress: () => { setStatus('waiting'); setWebViewError(false); openInBrowser(); startPolling(); } },
        { text: 'Quay lại', onPress: () => navigation.goBack() }
      ]
    );
  };

  const handleManualCheck = async () => {
    try {
      setStatus('checking');
      const result = await apiService.getPayOSPaymentStatus(orderCode);
      console.log('[PayOS Screen] Manual check result:', JSON.stringify(result));
      if (result.status === 'PAID') {
        setStatus('paid');
        await handlePaymentSuccess();
      } else {
        setStatus('waiting');
        Alert.alert('Chưa thanh toán', `Trạng thái: ${result.status}. Vui lòng hoàn tất thanh toán.`);
      }
    } catch (error) {
      setStatus('waiting');
      Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái thanh toán.');
    }
  };

  const handleCancel = () => {
    Alert.alert('Hủy thanh toán', 'Bạn có chắc muốn hủy thanh toán này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy',
        style: 'destructive',
        onPress: async () => {
          try { await apiService.cancelPayOSPayment(orderCode, 'User cancelled'); } catch (e) {}
          stopPolling();
          if (onCancel) onCancel('CANCELLED');
          navigation.goBack();
        }
      }
    ]);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amt) => `${Number(amt || 0).toLocaleString('vi-VN')}đ`;

  const getStatusInfo = () => {
    switch (status) {
      case 'waiting': return { icon: 'clock-outline', color: '#FF9800', text: 'Đang chờ thanh toán...' };
      case 'checking': return { icon: 'magnify', color: '#2196F3', text: 'Đang kiểm tra...' };
      case 'paid': return { icon: 'check-circle', color: '#4CAF50', text: 'Thanh toán thành công!' };
      case 'cancelled': return { icon: 'close-circle', color: '#F44336', text: 'Đã hủy thanh toán' };
      case 'timeout': return { icon: 'clock-alert', color: '#F44336', text: 'Hết thời gian' };
      default: return { icon: 'help-circle', color: '#9E9E9E', text: 'Không xác định' };
    }
  };

  const st = getStatusInfo();

  if (!checkoutUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán PayOS</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="alert-circle" size={60} color="#F44336" />
          <Text style={styles.errorText}>Không tìm thấy link thanh toán</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán PayOS</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.statusBox}>
          <MaterialCommunityIcons name={st.icon} size={60} color={st.color} />
          <Text style={[styles.statusText, { color: st.color }]}>{st.text}</Text>
          {status === 'waiting' && (
            <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Đơn hàng</Text>
            <Text style={styles.infoValue}>{orderId}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã thanh toán</Text>
            <Text style={styles.infoValue}>{orderCode}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tiền</Text>
            <Text style={styles.amountValue}>{formatAmount(amount)}</Text>
          </View>
          {buyerName ? (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Người mua</Text>
                <Text style={styles.infoValue}>{buyerName}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.btnGroup}>
          {status === 'waiting' && (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={openInBrowser}>
                <MaterialCommunityIcons name="open-in-new" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Mở trang thanh toán</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleManualCheck}>
                <MaterialCommunityIcons name="refresh" size={20} color="#FF6B35" />
                <Text style={styles.outlineBtnText}>Kiểm tra trạng thái</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.textBtn} onPress={handleCancel}>
                <Text style={styles.textBtnText}>Hủy thanh toán</Text>
              </TouchableOpacity>
            </>
          )}
          {(status === 'paid' || status === 'cancelled' || status === 'timeout') && (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryBtnText}>Quay lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, padding: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#666', marginTop: 12, marginBottom: 20, textAlign: 'center' },
  statusBox: { alignItems: 'center', paddingVertical: 24 },
  statusText: { fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  timerText: { fontSize: 14, color: '#999', marginTop: 4 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  amountValue: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  infoDivider: { height: 1, backgroundColor: '#F0F0F0' },
  btnGroup: { gap: 12 },
  primaryBtn: {
    backgroundColor: '#FF6B35', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  outlineBtn: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FF6B35',
  },
  outlineBtnText: { color: '#FF6B35', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  textBtn: { padding: 16, alignItems: 'center' },
  textBtnText: { color: '#999', fontSize: 14 },
});
