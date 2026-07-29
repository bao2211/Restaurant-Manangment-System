import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
<<<<<<< HEAD
import { useFocusEffect } from '@react-navigation/native';
import { apiService, formatPrice } from '../services/apiService';
=======
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { apiService, formatPrice, API_BASE_URL } from '../services/apiService';
>>>>>>> origin/my-local-branch
import { AuthContext } from '../context/AuthContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function BillManagerScreen() {
  const { user } = useContext(AuthContext);
<<<<<<< HEAD
=======
  const navigation = useNavigation();
>>>>>>> origin/my-local-branch
  const [completedOrders, setCompletedOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'bills'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'payment'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  const [filterPayment, setFilterPayment] = useState('all'); // 'all', 'cash', 'card', 'transfer', 'wallet', 'unpaid'
  const [showSortModal, setShowSortModal] = useState(false);
  const [filteredBills, setFilteredBills] = useState([]);
<<<<<<< HEAD
=======
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
>>>>>>> origin/my-local-branch

  // Bill form state
  const [billForm, setBillForm] = useState({
    discount: 0,
    payment: 'Tiền mặt',
  });

  const paymentMethods = [
    { value: 'Tiền mặt', label: 'Cash', icon: 'cash' },
    { value: 'Thẻ tín dụng', label: 'Credit Card', icon: 'credit-card' },
    { value: 'Chuyển khoản', label: 'Bank Transfer', icon: 'bank-transfer' },
    { value: 'Ví điện tử', label: 'E-Wallet', icon: 'wallet' },
<<<<<<< HEAD
=======
    { value: 'PayOS - Online', label: 'PayOS Online', icon: 'qrcode-scan' },
>>>>>>> origin/my-local-branch
    { value: 'Chưa thanh toán', label: 'Unpaid', icon: 'clock-outline' },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchData();
<<<<<<< HEAD
    }, [])
=======
    }, [sortOrder])
>>>>>>> origin/my-local-branch
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCompletedOrders(), fetchBills()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  // Extract payment method from order note
  const extractPaymentMethodFromNote = (note) => {
    if (!note) return null;
    
    // Look for "Thanh toán: [Method]" pattern in the note
    const paymentRegex = /Thanh toán:\s*(.+?)(?:\n|$)/i;
    const match = note.match(paymentRegex);
    
    if (match && match[1]) {
      const payment = match[1].trim();
      console.log('Extracted payment method:', payment);
      return payment;
    }
    
    return null;
  };

  // Auto-create bill for completed orders with payment method in note
  const autoCreateBillIfNeeded = async (order) => {
    try {
      const paymentMethod = extractPaymentMethodFromNote(order.note);
      
      if (!paymentMethod) {
        console.log(`Order ${order.id || order.orderId} has no payment method in note, skipping auto-bill`);
        return false;
      }
      
      console.log(`Auto-creating bill for order ${order.id || order.orderId} with payment: ${paymentMethod}`);
      
      const orderId = order.id || order.orderId;
      const total = await calculateOrderTotal(orderId);
      const billId = Math.random().toString(36).substr(2, 10);
      
      const billData = {
        billId: billId,
        orderId: orderId,
        userId: (order.userId || user?.userId)?.toString().trim(),
        userName: order.userName || user?.fullName || user?.userName || 'System',
        total: total,
        discount: 0,
        totalFinal: total,
        payment: paymentMethod,
        createdTime: new Date().toISOString(),
      };
      
      console.log('Auto-creating bill:', billData);
      await apiService.createBill(billData);
      
      // Update order status to indicate bill created
      const orderUpdateData = {
        orderId: orderId,
        tableId: order.tableId,
        userId: order.userId,
        createdTime: order.createDate || order.orderDate || order.createdTime,
        status: 'Đã tạo bill',
        total: order.total,
        discount: order.discount || 0,
        note: order.note || null,
        reservationId: order.reservationId || null
      };
      await apiService.updateOrder(orderId, orderUpdateData);
      
      console.log(`✓ Auto-created bill ${billId} for order ${orderId}`);
      return true;
    } catch (error) {
      console.error('Error auto-creating bill:', error);
      return false;
    }
  };

>>>>>>> origin/my-local-branch
  const fetchCompletedOrders = async () => {
    try {
      const ordersData = await apiService.getAllOrders();
      console.log('Fetching completed orders...');
      console.log('Total orders:', ordersData?.length || 0);
      
      // Filter orders that are completed but don't have bills yet
      const existingBills = await apiService.getAllBills();
      const billOrderIds = new Set(existingBills.map(bill => bill.orderId?.trim()));
      
      const completed = ordersData.filter(order => {
        const status = (order.status || '').toLowerCase().trim();
        const orderId = (order.id || order.orderId)?.trim();
        const isCompleted = status === 'hoàn tất' || status === 'complete' || status === 'completed';
        const hasNoBill = !billOrderIds.has(orderId);
        return isCompleted && hasNoBill;
      });
      
      console.log('Completed orders without bills:', completed.length);
      
<<<<<<< HEAD
      // Calculate totals for each order
      const ordersWithTotals = await Promise.all(
        completed.map(async order => {
=======
      // Auto-create bills for orders with payment method in note
      console.log('=== AUTO-CREATING BILLS FOR ORDERS WITH PAYMENT METHOD ===');
      for (const order of completed) {
        await autoCreateBillIfNeeded(order);
      }
      
      // Re-fetch to get updated list after auto-bill creation
      const updatedOrdersData = await apiService.getAllOrders();
      const updatedBills = await apiService.getAllBills();
      const updatedBillOrderIds = new Set(updatedBills.map(bill => bill.orderId?.trim()));
      
      const remainingCompleted = updatedOrdersData.filter(order => {
        const status = (order.status || '').toLowerCase().trim();
        const orderId = (order.id || order.orderId)?.trim();
        const isCompleted = status === 'hoàn tất' || status === 'complete' || status === 'completed';
        const hasNoBill = !updatedBillOrderIds.has(orderId);
        return isCompleted && hasNoBill;
      });
      
      console.log('Remaining completed orders without bills:', remainingCompleted.length);
      
      // Calculate totals for remaining orders
      const ordersWithTotals = await Promise.all(
        remainingCompleted.map(async order => {
>>>>>>> origin/my-local-branch
          const orderId = order.id || order.orderId;
          const total = await calculateOrderTotal(orderId);
          return { ...order, totalAmount: total };
        })
      );
      
<<<<<<< HEAD
      setCompletedOrders(ordersWithTotals);
=======
      // Sort orders by date like OrdersScreen
      const sortedOrders = ordersWithTotals.sort((a, b) => {
        const dateA = new Date(a.createDate || a.createdTime || a.createdAt || a.orderDate || 0);
        const dateB = new Date(b.createDate || b.createdTime || b.createdAt || b.orderDate || 0);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
      
      setCompletedOrders(sortedOrders);
>>>>>>> origin/my-local-branch
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      throw error;
    }
  };

  const fetchBills = async () => {
    try {
      const billsData = await apiService.getAllBills();
      console.log('Fetched bills:', billsData);
<<<<<<< HEAD
      setBills(billsData || []);
      setFilteredBills(billsData || []);
=======
      
      // Enrich bills with order information to determine online/dine-in
      const enrichedBills = await Promise.all(
        (billsData || []).map(async bill => {
          try {
            const orders = await apiService.getAllOrders();
            const order = orders.find(o => (o.id || o.orderId)?.trim() === bill.orderId?.trim());
            return {
              ...bill,
              tableId: order?.tableId || 'N/A'
            };
          } catch (error) {
            console.error(`Error fetching order ${bill.orderId}:`, error);
            return { ...bill, tableId: 'N/A' };
          }
        })
      );
      
      setBills(enrichedBills);
      setFilteredBills(enrichedBills);
>>>>>>> origin/my-local-branch
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  };

  // Sort and filter bills
  useEffect(() => {
    if (bills.length === 0) {
      setFilteredBills([]);
      return;
    }

    let result = [...bills];

    // Apply payment filter
    if (filterPayment !== 'all') {
      result = result.filter(bill => {
        const payment = (bill.payment || '').toLowerCase();
        switch (filterPayment) {
          case 'cash':
            return payment.includes('cash') || payment.includes('tiền mặt');
          case 'card':
            return payment.includes('card') || payment.includes('thẻ');
          case 'transfer':
            return payment.includes('transfer') || payment.includes('chuyển khoản');
          case 'wallet':
            return payment.includes('wallet') || payment.includes('ví');
          case 'unpaid':
            return payment.includes('chưa thanh toán') || payment.includes('unpaid');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdTime || 0).getTime();
          bValue = new Date(b.createdTime || 0).getTime();
          break;
        case 'amount':
          aValue = parseFloat(a.totalFinal || a.total || 0);
          bValue = parseFloat(b.totalFinal || b.total || 0);
          break;
        case 'payment':
          aValue = (a.payment || '').toLowerCase();
          bValue = (b.payment || '').toLowerCase();
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        default:
          return 0;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredBills(result);
  }, [bills, sortBy, sortDirection, filterPayment]);

  const calculateOrderTotal = async (orderId) => {
    try {
      const orderDetails = await apiService.getOrderDetails(orderId);
      if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
        return 0;
      }
      return orderDetails.reduce((sum, detail) => {
        const quantity = detail.quantity || 1;
        const unitPrice = detail.price || detail.unitPrice || 0;
        return sum + (quantity * unitPrice);
      }, 0);
    } catch (error) {
      console.error(`Error calculating total for order ${orderId}:`, error);
      return 0;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCreateBill = async () => {
    if (!selectedOrder) return;

<<<<<<< HEAD
    try {
      setCreating(true);
      
      const total = selectedOrder.totalAmount || 0;
      const discount = parseFloat(billForm.discount) || 0;
      const totalFinal = Math.max(0, total - discount);

      // Generate unique bill ID (10 characters like existing bills: 63fb378e3c)
      const billId = Math.random().toString(36).substr(2, 10);

      const orderId = selectedOrder.id || selectedOrder.orderId;

=======
    const orderId = selectedOrder.id || selectedOrder.orderId;
    const total = selectedOrder.totalAmount || 0;
    const discount = parseFloat(billForm.discount) || 0;
    const totalFinal = Math.max(0, total - discount);
    const isPayOS = billForm.payment === 'PayOS - Online';

    try {
      setCreating(true);
      console.log('[PayOS] Starting bill creation. isPayOS:', isPayOS, 'orderId:', orderId, 'totalFinal:', totalFinal);

      // Step 1: Create bill
      const billId = Math.random().toString(36).substr(2, 10);
>>>>>>> origin/my-local-branch
      const billData = {
        billId: billId,
        orderId: orderId,
        userId: (user?.userId || selectedOrder.userId)?.toString().trim(),
        userName: user?.fullName || user?.userName || 'Admin',
        total: total,
        discount: discount,
        totalFinal: totalFinal,
        payment: billForm.payment,
        createdTime: new Date().toISOString(),
      };

<<<<<<< HEAD
      console.log('Creating bill:', billData);
      await apiService.createBill(billData);

      // Note: Bill details are not created separately as the API requires 
      // navigation properties (Bill and Order objects) which causes validation errors.
      // The bill total is already calculated from order details.

      // Update order status to indicate bill created
      // Must match Order model property names: OrderId, CreatedTime (not id, orderDate)
=======
      console.log('[PayOS] Step 1: Creating bill...');
      await apiService.createBill(billData);
      console.log('[PayOS] Step 1 DONE: Bill created with ID:', billId);

      // Step 2: Update order status
      console.log('[PayOS] Step 2: Updating order status...');
>>>>>>> origin/my-local-branch
      const orderUpdateData = {
        orderId: orderId,
        tableId: selectedOrder.tableId,
        userId: selectedOrder.userId,
<<<<<<< HEAD
        createdTime: selectedOrder.orderDate, // API uses CreatedTime not OrderDate
=======
        createdTime: selectedOrder.orderDate,
>>>>>>> origin/my-local-branch
        status: 'Đã tạo bill',
        total: selectedOrder.total,
        discount: selectedOrder.discount || 0,
        note: selectedOrder.note || null,
        reservationId: selectedOrder.reservationId || null
      };
      await apiService.updateOrder(orderId, orderUpdateData);
<<<<<<< HEAD

      Alert.alert('Success', 'Bill created successfully!');
      setShowCreateModal(false);
      setSelectedOrder(null);
      setBillForm({ discount: 0, payment: 'Tiền mặt' });
      // Refresh data to update both lists
      await fetchData();
    } catch (error) {
      console.error('Error creating bill:', error);
      Alert.alert('Error', 'Failed to create bill. Please try again.');
=======
      console.log('[PayOS] Step 2 DONE: Order status updated');

      // Step 3: If PayOS, create payment link
      if (isPayOS) {
        console.log('[PayOS] Step 3: Creating PayOS payment link...');
        const buyerEmail = user?.email || user?.userName + '@payos.vn' || 'guest@payos.vn';
        const paymentData = {
          orderId: orderId,
          buyerName: user?.fullName || user?.userName || 'Guest',
          buyerEmail: buyerEmail,
          buyerPhone: user?.phone?.toString() || '0000000000',
          cancelUrl: 'https://payos.vn',
          returnUrl: 'https://payos.vn',
        };

        console.log('[PayOS] Step 3: Sending request with data:', JSON.stringify(paymentData));
        const payOSResult = await apiService.createPayOSPayment(paymentData);
        console.log('[PayOS] Step 3 DONE: PayOS result:', JSON.stringify(payOSResult));

        if (!payOSResult || !payOSResult.checkoutUrl) {
          throw new Error('PayOS did not return a checkout URL');
        }

        // Close modal and navigate
        setShowCreateModal(false);
        setSelectedOrder(null);
        setBillForm({ discount: 0, payment: 'Tiền mặt' });
        setCreating(false);

        console.log('[PayOS] Step 4: Navigating to PayOSCheckout...');
        navigation.navigate('PayOSCheckout', {
          orderId: orderId,
          checkoutUrl: payOSResult.checkoutUrl,
          orderCode: payOSResult.orderCode,
          amount: totalFinal,
          buyerName: user?.fullName || user?.userName || '',
          onSuccess: async (orderCode) => {
            console.log('[PayOS] Payment success for orderCode:', orderCode);
            await fetchData();
          },
          onCancel: (status) => {
            console.log('[PayOS] Payment cancelled:', status);
            fetchData();
          }
        });
        return; // Exit early, don't run cleanup below
      } else {
        // Non-PayOS: show success
        setShowCreateModal(false);
        Alert.alert('Thành công', 'Tạo hóa đơn thành công!');
      }

      // Cleanup for non-PayOS
      setSelectedOrder(null);
      setBillForm({ discount: 0, payment: 'Tiền mặt' });
      await fetchData();
    } catch (error) {
      console.error('[PayOS] ERROR at some step:', error);
      console.error('[PayOS] Error message:', error.message);
      console.error('[PayOS] Error response:', error.response?.data);

      let errorMsg = 'Không xác định';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }

      Alert.alert(
        'Lỗi tạo hóa đơn',
        `Chi tiết: ${errorMsg}`,
        [{ text: 'OK' }]
      );
>>>>>>> origin/my-local-branch
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateBillStatus = async () => {
    if (!selectedBill) return;

    try {
      setUpdating(true);

      const updatedBillData = {
        ...selectedBill,
        payment: billForm.payment,
        discount: parseFloat(billForm.discount) || selectedBill.discount || 0,
        totalFinal: (selectedBill.total || 0) - (parseFloat(billForm.discount) || selectedBill.discount || 0),
      };

      console.log('Updating bill:', updatedBillData);
      await apiService.updateBill(selectedBill.billId, updatedBillData);

      Alert.alert('Success', 'Bill updated successfully!');
      setShowEditModal(false);
      setSelectedBill(null);
      setBillForm({ discount: 0, payment: 'Tiền mặt' });
      await fetchData();
    } catch (error) {
      console.error('Error updating bill:', error);
      Alert.alert('Error', 'Failed to update bill. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintBill = async (bill) => {
    try {
      console.log('Printing bill:', bill.billId, 'Order:', bill.orderId);
      
      // Get order details directly (bill details are linked through order)
      const orderDetails = await apiService.getOrderDetails(bill.orderId);
      console.log('Order details for printing:', orderDetails);
      
      // Format order details for printing
      const detailsForPrint = orderDetails.map(detail => ({
        foodName: detail.foodName || 'Unknown Item',
        quantity: detail.quantity || 0,
        unitPrice: detail.unitPrice || 0,
        total: (detail.quantity || 0) * (detail.unitPrice || 0)
      }));

      console.log('Formatted details for print:', detailsForPrint);

      const html = generateBillHTML(bill, detailsForPrint);
      
      if (Platform.OS === 'web') {
        // For web, open in new window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      } else {
        // For mobile, use expo-print
        const { uri } = await Print.printToFileAsync({ html });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Success', 'Bill saved successfully!');
        }
      }
    } catch (error) {
      console.error('Error printing bill:', error);
      Alert.alert('Error', 'Failed to print bill. Please try again.');
    }
  };

  const generateBillHTML = (bill, details) => {
    const date = new Date(bill.createdTime).toLocaleString('vi-VN');
    
    console.log('generateBillHTML - Bill:', bill);
    console.log('generateBillHTML - Details:', details);
    console.log('generateBillHTML - Details is array:', Array.isArray(details));
    console.log('generateBillHTML - Details length:', details?.length);
    
    // Ensure details is an array
    const detailsArray = Array.isArray(details) ? details : [];
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bill #${bill.billId}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 80mm;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            font-size: 12px;
          }
          .info {
            margin: 15px 0;
            font-size: 12px;
          }
          .info div {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 12px;
          }
          th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 5px 0;
          }
          td {
            padding: 5px 0;
          }
          .right {
            text-align: right;
          }
          .totals {
            border-top: 1px solid #000;
            margin-top: 10px;
            padding-top: 10px;
          }
          .totals div {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 13px;
          }
          .final-total {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DELICIOUS BITES</h1>
          <p>Restaurant Management System</p>
          <p>Phone: +84 123 456 789</p>
        </div>
        
        <div class="info">
          <div><span>Bill ID:</span><strong>${bill.billId}</strong></div>
          <div><span>Order ID:</span><span>${bill.orderId}</span></div>
          <div><span>Date:</span><span>${date}</span></div>
          <div><span>Payment:</span><span>${bill.payment}</span></div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="right">Qty</th>
              <th class="right">Price</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${detailsArray.length > 0 ? detailsArray.map(detail => `
              <tr>
                <td>${detail.foodName || 'Unknown'}</td>
                <td class="right">${detail.quantity || 0}</td>
                <td class="right">${formatPrice(detail.unitPrice || 0)}</td>
                <td class="right">${formatPrice((detail.quantity || 0) * (detail.unitPrice || 0))}</td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align: center;">No items found</td></tr>'}
          </tbody>
        </table>
        
        <div class="totals">
          <div><span>Subtotal:</span><strong>${formatPrice(bill.total)}</strong></div>
          ${bill.discount > 0 ? `<div><span>Discount:</span><strong>-${formatPrice(bill.discount)}</strong></div>` : ''}
          <div class="final-total">
            <span>TOTAL:</span>
            <strong>${formatPrice(bill.totalFinal || bill.total)}</strong>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your visit!</p>
          <p>Please come again</p>
        </div>
      </body>
      </html>
    `;
  };

  const openCreateModal = (order) => {
    setSelectedOrder(order);
    setBillForm({ discount: 0, payment: 'Tiền mặt' });
    setShowCreateModal(true);
  };

  const openEditModal = (bill) => {
    setSelectedBill(bill);
    setBillForm({
      discount: bill.discount || 0,
      payment: bill.payment || 'Tiền mặt',
    });
    setShowEditModal(true);
  };

<<<<<<< HEAD
  const renderOrderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.orderIdContainer}>
          <MaterialCommunityIcons name="receipt" size={20} color="#3498DB" />
          <Text style={styles.orderId}>#{(item.id || item.orderId)?.substring(0, 10)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <MaterialCommunityIcons name="check-circle" size={16} color="#27AE60" />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="table-furniture" size={16} color="#7F8C8D" />
          <Text style={styles.infoText}>Table: {item.tableId}</Text>
        </View>
=======
  const renderOrderItem = ({ item }) => {
    const isOnline = item.tableId?.toString().trim() === '8';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <MaterialCommunityIcons name="receipt" size={20} color="#3498DB" />
            <Text style={styles.orderId}>#{(item.id || item.orderId)?.substring(0, 10)}</Text>
          </View>
          <View style={styles.headerBadges}>
            {isOnline ? (
              <View style={styles.orderTypeBadge}>
                <MaterialCommunityIcons name="truck-delivery" size={14} color="#FF6B35" />
                <Text style={styles.orderTypeText}>Online</Text>
              </View>
            ) : (
              <View style={[styles.orderTypeBadge, styles.dineInBadge]}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={14} color="#10B981" />
                <Text style={[styles.orderTypeText, styles.dineInText]}>Dine-in</Text>
              </View>
            )}
            <View style={styles.statusBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#27AE60" />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="table-furniture" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>Table: {item.tableId}</Text>
          </View>
>>>>>>> origin/my-local-branch
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#7F8C8D" />
          <Text style={styles.infoText}>
            {new Date(item.orderDate || item.createDate || item.createdTime).toLocaleString('vi-VN')}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>{formatPrice(item.totalAmount || 0)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => openCreateModal(item)}
      >
        <MaterialCommunityIcons name="plus-circle" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Bill</Text>
      </TouchableOpacity>
    </View>
<<<<<<< HEAD
  );

  const renderBillItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.orderIdContainer}>
          <MaterialCommunityIcons name="file-document" size={20} color="#E74C3C" />
          <Text style={styles.orderId}>#{item.billId?.substring(0, 10)}</Text>
        </View>
        <View style={[styles.paymentBadge, getPaymentBadgeStyle(item.payment)]}>
          <MaterialCommunityIcons 
            name={getPaymentIcon(item.payment)} 
            size={14} 
            color="#FFFFFF" 
          />
          <Text style={styles.paymentText}>{item.payment}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="receipt" size={16} color="#7F8C8D" />
          <Text style={styles.infoText}>Order: {item.orderId?.substring(0, 10)}</Text>
        </View>
=======
    );
  };

  const renderBillItem = ({ item }) => {
    const isOnline = item.tableId?.toString().trim() === '8';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <MaterialCommunityIcons name="file-document" size={20} color="#E74C3C" />
            <Text style={styles.orderId}>#{item.billId?.substring(0, 10)}</Text>
          </View>
          <View style={styles.headerBadges}>
            {isOnline ? (
              <View style={styles.orderTypeBadge}>
                <MaterialCommunityIcons name="truck-delivery" size={14} color="#FF6B35" />
                <Text style={styles.orderTypeText}>Online</Text>
              </View>
            ) : (
              <View style={[styles.orderTypeBadge, styles.dineInBadge]}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={14} color="#10B981" />
                <Text style={[styles.orderTypeText, styles.dineInText]}>Dine-in</Text>
              </View>
            )}
            <View style={[styles.paymentBadge, getPaymentBadgeStyle(item.payment)]}>
              <MaterialCommunityIcons 
                name={getPaymentIcon(item.payment)} 
                size={14} 
                color="#FFFFFF" 
              />
              <Text style={styles.paymentText}>{item.payment}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="receipt" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>Order: {item.orderId?.substring(0, 10)}</Text>
          </View>
>>>>>>> origin/my-local-branch
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#7F8C8D" />
          <Text style={styles.infoText}>
            {new Date(item.createdTime).toLocaleString('vi-VN')}
          </Text>
        </View>
        
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Subtotal:</Text>
            <Text style={styles.amountValue}>{formatPrice(item.total || 0)}</Text>
          </View>
          {item.discount > 0 && (
            <View style={styles.amountRow}>
              <Text style={styles.discountLabel}>Discount:</Text>
              <Text style={styles.discountValue}>-{formatPrice(item.discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Final Total:</Text>
            <Text style={styles.totalValue}>{formatPrice(item.totalFinal || item.total)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.printButton]}
          onPress={() => handlePrintBill(item)}
        >
          <MaterialCommunityIcons name="printer" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Print</Text>
        </TouchableOpacity>
      </View>
    </View>
<<<<<<< HEAD
  );
=======
    );
  };
>>>>>>> origin/my-local-branch

  const getPaymentIcon = (payment) => {
    const method = payment?.toLowerCase() || '';
    if (method.includes('cash') || method.includes('tiền mặt')) return 'cash';
    if (method.includes('card') || method.includes('thẻ')) return 'credit-card';
    if (method.includes('transfer') || method.includes('chuyển khoản')) return 'bank-transfer';
    if (method.includes('wallet') || method.includes('ví')) return 'wallet';
    return 'clock-outline';
  };

  const getPaymentBadgeStyle = (payment) => {
    const method = payment?.toLowerCase() || '';
    if (method.includes('chưa thanh toán') || method.includes('unpaid')) {
      return { backgroundColor: '#E74C3C' };
    }
    return { backgroundColor: '#27AE60' };
  };

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortDirection('desc');
    }
    setShowSortModal(false);
  };

  const getSortIcon = (criteria) => {
    if (sortBy !== criteria) return 'sort';
    return sortDirection === 'asc' ? 'sort-ascending' : 'sort-descending';
  };

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableOpacity
        style={styles.sortModalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <View style={styles.sortModalContent}>
          <Text style={styles.sortModalTitle}>Sort Bills</Text>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSort('date')}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={sortBy === 'date' ? '#3498DB' : '#7F8C8D'}
            />
            <Text style={[styles.sortOptionText, sortBy === 'date' && styles.activeSortOption]}>
              Date Created
            </Text>
            <MaterialCommunityIcons
              name={getSortIcon('date')}
              size={20}
              color={sortBy === 'date' ? '#3498DB' : '#7F8C8D'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSort('amount')}
          >
            <MaterialCommunityIcons
              name="currency-usd"
              size={20}
              color={sortBy === 'amount' ? '#3498DB' : '#7F8C8D'}
            />
            <Text style={[styles.sortOptionText, sortBy === 'amount' && styles.activeSortOption]}>
              Amount
            </Text>
            <MaterialCommunityIcons
              name={getSortIcon('amount')}
              size={20}
              color={sortBy === 'amount' ? '#3498DB' : '#7F8C8D'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSort('payment')}
          >
            <MaterialCommunityIcons
              name="credit-card"
              size={20}
              color={sortBy === 'payment' ? '#3498DB' : '#7F8C8D'}
            />
            <Text style={[styles.sortOptionText, sortBy === 'payment' && styles.activeSortOption]}>
              Payment Method
            </Text>
            <MaterialCommunityIcons
              name={getSortIcon('payment')}
              size={20}
              color={sortBy === 'payment' ? '#3498DB' : '#7F8C8D'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filterPayment === 'all' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('all')}
        >
          <Text style={[styles.filterChipText, filterPayment === 'all' && styles.activeFilterChipText]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterPayment === 'cash' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('cash')}
        >
          <MaterialCommunityIcons name="cash" size={16} color={filterPayment === 'cash' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'cash' && styles.activeFilterChipText]}>
            Cash
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterPayment === 'card' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('card')}
        >
          <MaterialCommunityIcons name="credit-card" size={16} color={filterPayment === 'card' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'card' && styles.activeFilterChipText]}>
            Card
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterPayment === 'transfer' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('transfer')}
        >
          <MaterialCommunityIcons name="bank-transfer" size={16} color={filterPayment === 'transfer' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'transfer' && styles.activeFilterChipText]}>
            Transfer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterPayment === 'wallet' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('wallet')}
        >
          <MaterialCommunityIcons name="wallet" size={16} color={filterPayment === 'wallet' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'wallet' && styles.activeFilterChipText]}>
            Wallet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterPayment === 'unpaid' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('unpaid')}
        >
          <MaterialCommunityIcons name="clock-outline" size={16} color={filterPayment === 'unpaid' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'unpaid' && styles.activeFilterChipText]}>
            Unpaid
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Bill</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedOrder && (
              <>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Order Information</Text>
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoText}>Order ID: {selectedOrder.id || selectedOrder.orderId}</Text>
                    <Text style={styles.modalInfoText}>Table: {selectedOrder.tableId}</Text>
                    <Text style={styles.modalInfoText}>
                      Amount: {formatPrice(selectedOrder.totalAmount || 0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Discount Amount</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter discount amount"
                    keyboardType="numeric"
                    value={billForm.discount.toString()}
                    onChangeText={(text) => setBillForm({ ...billForm, discount: text })}
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Payment Method</Text>
                  <View style={styles.paymentMethodsGrid}>
                    {paymentMethods.map((method) => (
                      <TouchableOpacity
                        key={method.value}
                        style={[
                          styles.paymentMethodButton,
                          billForm.payment === method.value && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setBillForm({ ...billForm, payment: method.value })}
                      >
                        <MaterialCommunityIcons
                          name={method.icon}
                          size={24}
                          color={billForm.payment === method.value ? '#FFFFFF' : '#7F8C8D'}
                        />
                        <Text
                          style={[
                            styles.paymentMethodText,
                            billForm.payment === method.value && styles.paymentMethodTextSelected,
                          ]}
                        >
                          {method.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Summary</Text>
                  <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal:</Text>
                      <Text style={styles.summaryValue}>
                        {formatPrice(selectedOrder.totalAmount || 0)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Discount:</Text>
                      <Text style={styles.summaryValue}>
                        -{formatPrice(parseFloat(billForm.discount) || 0)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryTotal]}>
                      <Text style={styles.summaryTotalLabel}>Final Total:</Text>
                      <Text style={styles.summaryTotalValue}>
                        {formatPrice(
                          Math.max(0, (selectedOrder.totalAmount || 0) - (parseFloat(billForm.discount) || 0))
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleCreateBill}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Create Bill</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Bill</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedBill && (
              <>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Bill Information</Text>
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoText}>Bill ID: {selectedBill.billId}</Text>
                    <Text style={styles.modalInfoText}>Order ID: {selectedBill.orderId}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Discount Amount</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter discount amount"
                    keyboardType="numeric"
                    value={billForm.discount.toString()}
                    onChangeText={(text) => setBillForm({ ...billForm, discount: text })}
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Payment Method</Text>
                  <View style={styles.paymentMethodsGrid}>
                    {paymentMethods.map((method) => (
                      <TouchableOpacity
                        key={method.value}
                        style={[
                          styles.paymentMethodButton,
                          billForm.payment === method.value && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setBillForm({ ...billForm, payment: method.value })}
                      >
                        <MaterialCommunityIcons
                          name={method.icon}
                          size={24}
                          color={billForm.payment === method.value ? '#FFFFFF' : '#7F8C8D'}
                        />
                        <Text
                          style={[
                            styles.paymentMethodText,
                            billForm.payment === method.value && styles.paymentMethodTextSelected,
                          ]}
                        >
                          {method.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Summary</Text>
                  <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal:</Text>
                      <Text style={styles.summaryValue}>{formatPrice(selectedBill.total || 0)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Discount:</Text>
                      <Text style={styles.summaryValue}>
                        -{formatPrice(parseFloat(billForm.discount) || 0)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryTotal]}>
                      <Text style={styles.summaryTotalLabel}>Final Total:</Text>
                      <Text style={styles.summaryTotalValue}>
                        {formatPrice(
                          Math.max(0, (selectedBill.total || 0) - (parseFloat(billForm.discount) || 0))
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleUpdateBillStatus}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Update Bill</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

<<<<<<< HEAD
  return (
    <View style={styles.container}>
=======
  const testPayOS = async () => {
    try {
      Alert.alert('Test PayOS', 'Đang tạo link thanh toán PayOS...');
      console.log('[PayOS Test] Starting...');
      
      // Get a real order from the database
      const orders = await apiService.getAllOrders();
      const completedOrder = orders.find(o => {
        const status = (o.status || '').toLowerCase();
        return status === 'hoàn tất' || status === 'completed' || status === 'complete';
      });
      
      if (!completedOrder) {
        Alert.alert('Lỗi', 'Không tìm thấy đơn hàng hoàn tất để test. Vui lòng tạo đơn hàng trước.');
        return;
      }
      
      const orderId = completedOrder.id || completedOrder.orderId;
      const total = completedOrder.totalAmount || completedOrder.total || 10000;
      
      console.log('[PayOS Test] Using order:', orderId, 'total:', total);
      
      const testData = {
        orderId: orderId,
        buyerName: 'Test User',
        buyerEmail: 'test@test.com',
        buyerPhone: '0123456789',
        cancelUrl: 'https://payos.vn',
        returnUrl: 'https://payos.vn',
      };
      
      console.log('[PayOS Test] Sending request:', JSON.stringify(testData));
      const result = await apiService.createPayOSPayment(testData);
      console.log('[PayOS Test] Result:', JSON.stringify(result));
      
      if (result && result.checkoutUrl) {
        Alert.alert('Thành công!', `Checkout URL: ${result.checkoutUrl.substring(0, 50)}...`);
        navigation.navigate('PayOSCheckout', {
          orderId: orderId,
          checkoutUrl: result.checkoutUrl,
          orderCode: result.orderCode,
          amount: total,
          buyerName: 'Test User',
        });
      } else {
        Alert.alert('Lỗi', 'Không nhận được checkout URL');
      }
    } catch (error) {
      console.error('[PayOS Test] Error:', error);
      Alert.alert('Lỗi Test PayOS', error.message || 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ backgroundColor: '#FF6B35', padding: 12, margin: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
        onPress={testPayOS}
      >
        <MaterialCommunityIcons name="qrcode-scan" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>TEST PAYOS</Text>
      </TouchableOpacity>

>>>>>>> origin/my-local-branch
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <MaterialCommunityIcons
            name="clipboard-list"
            size={20}
            color={activeTab === 'orders' ? '#3498DB' : '#7F8C8D'}
          />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Completed Orders ({completedOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bills' && styles.activeTab]}
          onPress={() => setActiveTab('bills')}
        >
          <MaterialCommunityIcons
            name="file-document"
            size={20}
            color={activeTab === 'bills' ? '#3498DB' : '#7F8C8D'}
          />
          <Text style={[styles.tabText, activeTab === 'bills' && styles.activeTabText]}>
            Bills ({filteredBills.length}/{bills.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'orders' ? (
<<<<<<< HEAD
        <FlatList
          data={completedOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id || item.orderId}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={80} color="#BDC3C7" />
              <Text style={styles.emptyTitle}>No Completed Orders</Text>
              <Text style={styles.emptySubtitle}>
                Completed orders ready for billing will appear here
              </Text>
            </View>
          }
        />
=======
        <>
          <View style={styles.ordersHeader}>
            <View style={styles.sortOrderButtons}>
              <TouchableOpacity
                style={[styles.sortOrderButton, sortOrder === 'newest' && styles.sortOrderButtonActive]}
                onPress={() => setSortOrder('newest')}
              >
                <MaterialCommunityIcons 
                  name="sort-clock-descending" 
                  size={18} 
                  color={sortOrder === 'newest' ? '#FFFFFF' : '#3498DB'} 
                />
                <Text style={[styles.sortOrderButtonText, sortOrder === 'newest' && styles.sortOrderButtonTextActive]}>
                  Newest First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortOrderButton, sortOrder === 'oldest' && styles.sortOrderButtonActive]}
                onPress={() => setSortOrder('oldest')}
              >
                <MaterialCommunityIcons 
                  name="sort-clock-ascending" 
                  size={18} 
                  color={sortOrder === 'oldest' ? '#FFFFFF' : '#3498DB'} 
                />
                <Text style={[styles.sortOrderButtonText, sortOrder === 'oldest' && styles.sortOrderButtonTextActive]}>
                  Oldest First
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={completedOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id || item.orderId}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={80} color="#BDC3C7" />
                <Text style={styles.emptyTitle}>No Completed Orders</Text>
                <Text style={styles.emptySubtitle}>
                  Completed orders ready for billing will appear here
                </Text>
              </View>
            }
          />
        </>
>>>>>>> origin/my-local-branch
      ) : (
        <>
          <View style={styles.billsHeader}>
            {renderFilterBar()}
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <MaterialCommunityIcons name="sort" size={20} color="#3498DB" />
              <Text style={styles.sortButtonText}>Sort</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredBills}
            renderItem={renderBillItem}
            keyExtractor={(item) => item.billId}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="file-document-outline" size={80} color="#BDC3C7" />
                <Text style={styles.emptyTitle}>No Bills Found</Text>
                <Text style={styles.emptySubtitle}>
                  {filterPayment !== 'all'
                    ? `No bills found with ${filterPayment} payment method`
                    : 'Created bills will appear here'}
                </Text>
              </View>
            }
          />
        </>
      )}

      {renderCreateModal()}
      {renderEditModal()}
      {renderSortModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: '#F5F5F5',
=======
    backgroundColor: '#F8F9FA',
>>>>>>> origin/my-local-branch
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
<<<<<<< HEAD
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
=======
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#636E72',
    fontWeight: '500',
>>>>>>> origin/my-local-branch
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
<<<<<<< HEAD
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
=======
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
>>>>>>> origin/my-local-branch
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3498DB',
=======
    paddingVertical: 18,
    gap: 10,
  },
  activeTab: {
    borderBottomWidth: 4,
    borderBottomColor: '#3498DB',
    backgroundColor: 'rgba(52, 152, 219, 0.04)',
>>>>>>> origin/my-local-branch
  },
  tabText: {
    fontSize: 14,
    color: '#7F8C8D',
<<<<<<< HEAD
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498DB',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
=======
    fontWeight: '600',
  },
  activeTabText: {
    color: '#3498DB',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.08)',
>>>>>>> origin/my-local-branch
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
<<<<<<< HEAD
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
=======
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 152, 219, 0.1)',
>>>>>>> origin/my-local-branch
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
=======
    gap: 10,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    letterSpacing: 0.3,
>>>>>>> origin/my-local-branch
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    gap: 4,
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
=======
    gap: 5,
    backgroundColor: '#D5F5E3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#1E8449',
    fontWeight: '700',
>>>>>>> origin/my-local-branch
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
=======
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
>>>>>>> origin/my-local-branch
  },
  paymentText: {
    fontSize: 11,
    color: '#FFFFFF',
<<<<<<< HEAD
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
=======
    fontWeight: '700',
  },
  cardBody: {
    gap: 12,
>>>>>>> origin/my-local-branch
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  amountSection: {
    marginTop: 8,
    gap: 4,
=======
    gap: 10,
    backgroundColor: 'rgba(52, 152, 219, 0.04)',
    padding: 10,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 1,
  },
  amountSection: {
    marginTop: 12,
    gap: 10,
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.12)',
>>>>>>> origin/my-local-branch
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
<<<<<<< HEAD
    fontSize: 13,
    color: '#7F8C8D',
  },
  amountValue: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '500',
  },
  discountLabel: {
    fontSize: 13,
    color: '#E74C3C',
  },
  discountValue: {
    fontSize: 13,
    color: '#E74C3C',
    fontWeight: '500',
=======
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '700',
  },
  discountLabel: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: '700',
>>>>>>> origin/my-local-branch
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
<<<<<<< HEAD
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
=======
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: 'rgba(52, 152, 219, 0.2)',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3498DB',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
>>>>>>> origin/my-local-branch
    color: '#27AE60',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    gap: 8,
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
=======
    gap: 10,
    backgroundColor: '#3498DB',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 14,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
>>>>>>> origin/my-local-branch
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
<<<<<<< HEAD
    fontWeight: '600',
=======
    fontWeight: '700',
>>>>>>> origin/my-local-branch
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
<<<<<<< HEAD
    marginTop: 12,
=======
    marginTop: 14,
>>>>>>> origin/my-local-branch
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
=======
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
>>>>>>> origin/my-local-branch
  },
  editButton: {
    backgroundColor: '#F39C12',
  },
  printButton: {
    backgroundColor: '#8E44AD',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
<<<<<<< HEAD
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 20,
=======
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#636E72',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
>>>>>>> origin/my-local-branch
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
=======
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
>>>>>>> origin/my-local-branch
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
<<<<<<< HEAD
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
=======
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 20,
>>>>>>> origin/my-local-branch
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
<<<<<<< HEAD
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
=======
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 152, 219, 0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
>>>>>>> origin/my-local-branch
    color: '#2C3E50',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  modalInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  modalInfoText: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  input: {
<<<<<<< HEAD
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#2C3E50',
=======
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.2)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
>>>>>>> origin/my-local-branch
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentMethodButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
=======
    gap: 10,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.15)',
    backgroundColor: '#F8F9FA',
>>>>>>> origin/my-local-branch
  },
  paymentMethodSelected: {
    borderColor: '#3498DB',
    backgroundColor: '#3498DB',
<<<<<<< HEAD
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
=======
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '600',
>>>>>>> origin/my-local-branch
    textAlign: 'center',
  },
  paymentMethodTextSelected: {
    color: '#FFFFFF',
<<<<<<< HEAD
    fontWeight: '600',
  },
  summaryBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    gap: 8,
=======
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
    padding: 18,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.15)',
>>>>>>> origin/my-local-branch
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
<<<<<<< HEAD
    color: '#7F8C8D',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  summaryTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E8E8E8',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
=======
    color: '#636E72',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '600',
  },
  summaryTotal: {
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 2,
    borderTopColor: 'rgba(52, 152, 219, 0.25)',
  },
  summaryTotalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#3498DB',
  },
  summaryTotalValue: {
    fontSize: 22,
    fontWeight: '900',
>>>>>>> origin/my-local-branch
    color: '#27AE60',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
<<<<<<< HEAD
    borderTopColor: '#E8E8E8',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
=======
    borderTopColor: 'rgba(52, 152, 219, 0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
>>>>>>> origin/my-local-branch
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
<<<<<<< HEAD
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  confirmButton: {
    backgroundColor: '#3498DB',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
=======
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.2)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#636E72',
  },
  confirmButton: {
    backgroundColor: '#3498DB',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
>>>>>>> origin/my-local-branch
    color: '#FFFFFF',
  },
  // Bills Header Styles
  billsHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
=======
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498DB',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '700',
>>>>>>> origin/my-local-branch
    color: '#3498DB',
  },
  // Sort Modal Styles
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  activeSortOption: {
    color: '#3498DB',
    fontWeight: '600',
  },
  // Filter Bar Styles
  filterBar: {
<<<<<<< HEAD
    paddingVertical: 12,
=======
    paddingVertical: 14,
>>>>>>> origin/my-local-branch
    paddingHorizontal: 16,
  },
  filterScrollContainer: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
=======
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.15)',
>>>>>>> origin/my-local-branch
  },
  activeFilterChip: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
<<<<<<< HEAD
  },
  filterChipText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '500',
=======
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  filterChipText: {
    fontSize: 13,
    color: '#636E72',
    marginLeft: 6,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Order Type Badge Styles
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  dineInBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  orderTypeText: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '700',
  },
  dineInText: {
    color: '#10B981',
  },
  // Orders Header Styles
  ordersHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sortOrderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sortOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498DB',
    backgroundColor: '#FFFFFF',
  },
  sortOrderButtonActive: {
    backgroundColor: '#3498DB',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sortOrderButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3498DB',
  },
  sortOrderButtonTextActive: {
    color: '#FFFFFF',
>>>>>>> origin/my-local-branch
  },
});
