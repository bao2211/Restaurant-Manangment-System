import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ScreenHeader from '../components/ScreenHeader';

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    fullName: '',
    role: '',
    phone: '',
    email: '',
    right: '',
  });

  const { user: currentUser, getUserRole } = useContext(AuthContext);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    console.log('UserManagementScreen: useEffect triggered');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('UserManagementScreen: Starting to fetch users...');
      const usersData = await apiService.getAllUsers();
      console.log('UserManagementScreen: Raw fetched users:', usersData);
      console.log('UserManagementScreen: Is array?', Array.isArray(usersData));
      console.log('UserManagementScreen: Length:', usersData?.length);
      
      if (usersData && Array.isArray(usersData)) {
        console.log('UserManagementScreen: Setting users array with length:', usersData.length);
        setUsers(usersData);
      } else if (usersData) {
        console.log('UserManagementScreen: Data is not array, wrapping in array');
        setUsers([usersData]);
      } else {
        console.log('UserManagementScreen: No data received, setting empty array');
        setUsers([]);
      }
    } catch (error) {
      console.error('UserManagementScreen: Error fetching users:', error);
      showError('Lỗi khi tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, []);

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'Admin': 'Quản trị viên',
      'admin': 'Quản trị viên',
      'ADMIN': 'Quản trị viên',
      'NV': 'Nhân viên',
      'nv': 'Nhân viên',
      'TN': 'Thu ngân',
      'tn': 'Thu ngân',
      'Bep': 'Bếp',
      'bep': 'Bếp',
      'BEP': 'Bếp',
      'Customer': 'Khách hàng',
      'customer': 'Khách hàng',
      'CUSTOMER': 'Khách hàng',
      'Staff': 'Nhân viên',
      'staff': 'Nhân viên',
    };
    return roleMap[role] || role || 'Không xác định';
  };

  const getRoleColor = (role) => {
    const colorMap = {
      'Admin': '#E74C3C',
      'admin': '#E74C3C',
      'ADMIN': '#E74C3C',
      'NV': '#3498DB',
      'nv': '#3498DB',
      'TN': '#27AE60',
      'tn': '#27AE60',
      'Bep': '#F39C12',
      'bep': '#F39C12',
      'BEP': '#F39C12',
      'Customer': '#9B59B6',
      'customer': '#9B59B6',
      'CUSTOMER': '#9B59B6',
      'Staff': '#34495E',
      'staff': '#34495E',
    };
    return colorMap[role] || '#7F8C8D';
  };

  const getRoleIcon = (role) => {
    const iconMap = {
      'Admin': 'shield-crown',
      'admin': 'shield-crown',
      'ADMIN': 'shield-crown',
      'NV': 'account-tie',
      'nv': 'account-tie',
      'TN': 'cash-register',
      'tn': 'cash-register',
      'Bep': 'chef-hat',
      'bep': 'chef-hat',
      'BEP': 'chef-hat',
      'Customer': 'account',
      'customer': 'account',
      'CUSTOMER': 'account',
      'Staff': 'account-group',
      'staff': 'account-group',
    };
    return iconMap[role] || 'account-question';
  };

  const handleUserPress = (user) => {
    setSelectedUser(user);
    setFormData({
      userName: user.userName || '',
      fullName: user.fullName || user.FullName || '',
      role: user.role || user.Role || '',
      phone: user.phone?.toString() || user.Phone?.toString() || '',
      email: user.email || user.Email || '',
      right: user.right || user.Right || '',
    });
    setEditMode(false);
    setModalVisible(true);
  };

  const handleEditUser = () => {
    setEditMode(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!selectedUser) return;

      const updateData = {
        UserId: selectedUser.userId || selectedUser.UserId,
        UserName: formData.userName,
        Password: selectedUser.password || selectedUser.Password, // Keep existing password
        Role: formData.role,
        FullName: formData.fullName,
        Phone: formData.phone,
        Email: formData.email,
        Right: formData.right,
      };

      await apiService.updateUser(selectedUser.userId || selectedUser.UserId, updateData);
      showSuccess('Cập nhật người dùng thành công');
      setModalVisible(false);
      setEditMode(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Lỗi khi cập nhật người dùng');
    }
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    // Prevent deletion of current user
    if (selectedUser.userId === currentUser?.userId || selectedUser.UserId === currentUser?.userId) {
      showError('Không thể xóa tài khoản của chính mình');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa người dùng "${selectedUser.userName || selectedUser.UserName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteUser(selectedUser.userId || selectedUser.UserId);
              showSuccess('Xóa người dùng thành công');
              setModalVisible(false);
              fetchUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              showError('Lỗi khi xóa người dùng');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => {
    console.log('UserManagementScreen: Rendering user item:', item);
    const userRole = item.role || item.Role || '';
    const isCurrentUser = (item.userId || item.UserId) === currentUser?.userId;

    return (
      <TouchableOpacity
        style={[styles.userCard, isCurrentUser && styles.currentUserCard]}
        onPress={() => handleUserPress(item)}
      >
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userNameContainer}>
              <MaterialCommunityIcons
                name={getRoleIcon(userRole)}
                size={24}
                color={getRoleColor(userRole)}
              />
              <Text style={styles.userName}>
                {item.userName || item.UserName || 'N/A'}
              </Text>
              {isCurrentUser && (
                <View style={styles.currentUserBadge}>
                  <Text style={styles.currentUserText}>Bạn</Text>
                </View>
              )}
            </View>
            <Text style={styles.fullName}>
              {item.fullName || item.FullName || 'Chưa có tên đầy đủ'}
            </Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userRole) }]}>
            <Text style={styles.roleText}>{getRoleDisplayName(userRole)}</Text>
          </View>
        </View>

        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone" size={16} color="#7F8C8D" />
            <Text style={styles.detailText}>
              {item.phone || item.Phone || 'Chưa có số điện thoại'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="email" size={16} color="#7F8C8D" />
            <Text style={styles.detailText}>
              {item.email || item.Email || 'Chưa có email'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="shield-account" size={16} color="#7F8C8D" />
            <Text style={styles.detailText}>
              Quyền: {item.right || item.Right || 'USER'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const UserDetailModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        setModalVisible(false);
        setEditMode(false);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
              setEditMode(false);
            }}
          >
            <MaterialCommunityIcons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editMode ? 'Chỉnh sửa người dùng' : 'Thông tin người dùng'}
          </Text>
          <View style={styles.headerActions}>
            {!editMode && selectedUser && (
              <>
                <TouchableOpacity style={styles.editButton} onPress={handleEditUser}>
                  <MaterialCommunityIcons name="pencil" size={20} color="white" />
                </TouchableOpacity>
                {selectedUser.userId !== currentUser?.userId && (
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteUser}>
                    <MaterialCommunityIcons name="delete" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </>
            )}
            {editMode && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveUser}>
                <MaterialCommunityIcons name="check" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedUser && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tên đăng nhập</Text>
                {editMode ? (
                  <TextInput
                    style={styles.input}
                    value={formData.userName}
                    onChangeText={(text) => setFormData({ ...formData, userName: text })}
                    placeholder="Tên đăng nhập"
                  />
                ) : (
                  <Text style={styles.value}>{selectedUser.userName || selectedUser.UserName}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tên đầy đủ</Text>
                {editMode ? (
                  <TextInput
                    style={styles.input}
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    placeholder="Tên đầy đủ"
                  />
                ) : (
                  <Text style={styles.value}>{selectedUser.fullName || selectedUser.FullName || 'Chưa có'}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Vai trò</Text>
                {editMode ? (
                  <TextInput
                    style={styles.input}
                    value={formData.role}
                    onChangeText={(text) => setFormData({ ...formData, role: text })}
                    placeholder="Vai trò"
                  />
                ) : (
                  <View style={styles.roleContainer}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(selectedUser.role || selectedUser.Role) }]}>
                      <Text style={styles.roleText}>{getRoleDisplayName(selectedUser.role || selectedUser.Role)}</Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                {editMode ? (
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    placeholder="Số điện thoại"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.value}>{selectedUser.phone || selectedUser.Phone || 'Chưa có'}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                {editMode ? (
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="Email"
                    keyboardType="email-address"
                  />
                ) : (
                  <Text style={styles.value}>{selectedUser.email || selectedUser.Email || 'Chưa có'}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Quyền hạn</Text>
                {editMode ? (
                  <TextInput
                    style={styles.input}
                    value={formData.right}
                    onChangeText={(text) => setFormData({ ...formData, right: text })}
                    placeholder="Quyền hạn"
                  />
                ) : (
                  <Text style={styles.value}>{selectedUser.right || selectedUser.Right || 'USER'}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ID người dùng</Text>
                <Text style={styles.value}>{selectedUser.userId || selectedUser.UserId}</Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
      </View>
    );
  }

  console.log('UserManagementScreen: Rendering with users state:', users);
  console.log('UserManagementScreen: Users length in render:', users.length);
  console.log('UserManagementScreen: Loading state:', loading);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Quản lý người dùng"
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item, index) => (item.userId || item.UserId || `user-${index}`).toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-group" size={60} color="#BDC3C7" />
            <Text style={styles.emptyText}>Không có người dùng nào</Text>
            <Text style={styles.emptySubtext}>Kéo xuống để làm mới</Text>
          </View>
        }
      />

      <UserDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  currentUserBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  currentUserText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 32,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#3498DB',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    padding: 8,
    borderRadius: 20,
  },
  saveButton: {
    backgroundColor: '#27AE60',
    padding: 8,
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#34495E',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  input: {
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  roleContainer: {
    alignItems: 'flex-start',
  },
});

export default UserManagementScreen;