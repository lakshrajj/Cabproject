// DOM Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const usersContainer = document.getElementById('users-container');
const ridesContainer = document.getElementById('rides-container');
const bookingsContainer = document.getElementById('bookings-container');

const dashboardLink = document.getElementById('dashboard-link');
const usersLink = document.getElementById('users-link');
const ridesLink = document.getElementById('rides-link');
const bookingsLink = document.getElementById('bookings-link');
const logoutLink = document.getElementById('logout-link');

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// API Base URL
const API_URL = '/api';

// Current page state
let currentPage = {
  users: 1,
  rides: 1,
  bookings: 1
};

// Current active user/ride/booking for modals
let activeItemId = null;

// Check Authentication Status
function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    showLoginForm();
    return false;
  }
  
  // Verify token is valid by checking current user
  fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Authentication failed');
    }
    return response.json();
  })
  .then(data => {
    // Check if user is admin
    if (data.data.role !== 'admin') {
      logout();
      loginError.textContent = 'Access denied. Admin privileges required.';
      return;
    }
    
    showDashboard();
    loadDashboardData();
  })
  .catch(error => {
    console.error('Auth error:', error);
    logout();
  });
  
  return true;
}

// Show specific container
function showContainer(containerId) {
  [loginContainer, dashboardContainer, usersContainer, ridesContainer, bookingsContainer].forEach(container => {
    container.classList.add('d-none');
  });
  
  document.getElementById(containerId).classList.remove('d-none');
  
  // Update active nav link
  [dashboardLink, usersLink, ridesLink, bookingsLink].forEach(link => {
    link.classList.remove('active');
  });
  
  if (containerId === 'dashboard-container') {
    dashboardLink.classList.add('active');
  } else if (containerId === 'users-container') {
    usersLink.classList.add('active');
  } else if (containerId === 'rides-container') {
    ridesLink.classList.add('active');
  } else if (containerId === 'bookings-container') {
    bookingsLink.classList.add('active');
  }
}

// Show login form
function showLoginForm() {
  showContainer('login-container');
}

// Show dashboard
function showDashboard() {
  showContainer('dashboard-container');
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  showLoginForm();
}

// Login form submission
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Check if user is admin
      if (data.user.role !== 'admin') {
        loginError.textContent = 'Access denied. Admin privileges required.';
        return;
      }
      
      // Save token and show dashboard
      localStorage.setItem('token', data.token);
      showDashboard();
      loadDashboardData();
    } else {
      loginError.textContent = data.message || 'Login failed';
    }
  })
  .catch(error => {
    console.error('Login error:', error);
    loginError.textContent = 'An error occurred. Please try again.';
  });
});

// Load Dashboard Data
function loadDashboardData() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  // Fetch dashboard stats
  fetch(`${API_URL}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update dashboard cards
      document.getElementById('total-users').textContent = data.data.users.total;
      document.getElementById('riders-count').textContent = data.data.users.riders;
      document.getElementById('drivers-count').textContent = data.data.users.drivers;
      document.getElementById('blocked-users').textContent = data.data.users.blocked;
      
      const blockedPercentage = data.data.users.total > 0 
        ? Math.round((data.data.users.blocked / data.data.users.total) * 100) 
        : 0;
      document.getElementById('blocked-percentage').textContent = `${blockedPercentage}%`;
      
      document.getElementById('total-rides').textContent = data.data.rides.total;
      document.getElementById('active-rides').textContent = 
        data.data.rides.scheduled + data.data.rides.inProgress;
      document.getElementById('completed-rides').textContent = data.data.rides.completed;
      
      document.getElementById('total-bookings').textContent = data.data.bookings.total;
      document.getElementById('pending-bookings').textContent = data.data.bookings.pending;
      document.getElementById('completed-bookings').textContent = data.data.bookings.completed;
    }
  })
  .catch(error => {
    console.error('Error loading dashboard stats:', error);
  });
  
  // Fetch recent users
  fetch(`${API_URL}/admin/recent-users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const usersTable = document.getElementById('recent-users-table');
      usersTable.innerHTML = '';
      
      data.data.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>
            <span class="badge ${user.isBlocked ? 'bg-danger' : 'bg-success'}">
              ${user.isBlocked ? 'Blocked' : 'Active'}
            </span>
          </td>
        `;
        usersTable.appendChild(row);
      });
    }
  })
  .catch(error => {
    console.error('Error loading recent users:', error);
  });
  
  // Fetch recent rides
  fetch(`${API_URL}/admin/recent-rides`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const ridesTable = document.getElementById('recent-rides-table');
      ridesTable.innerHTML = '';
      
      data.data.forEach(ride => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${ride.driver ? ride.driver.name : 'Unknown'}</td>
          <td>${ride.startLocation.address}</td>
          <td>${ride.endLocation.address}</td>
          <td>
            <span class="badge bg-${getStatusBadgeClass(ride.status)}">
              ${formatStatus(ride.status)}
            </span>
          </td>
        `;
        ridesTable.appendChild(row);
      });
    }
  })
  .catch(error => {
    console.error('Error loading recent rides:', error);
  });
}

// Load Users Data
function loadUsersData(page = 1, role = '') {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  // Fetch users with pagination
  let url = `${API_URL}/users?page=${page}&limit=10`;
  if (role) {
    url += `&role=${role}`;
  }
  
  fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const usersTable = document.getElementById('users-table');
      usersTable.innerHTML = '';
      
      data.data.docs.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td>${capitalizeFirstLetter(user.role)}</td>
          <td>
            <span class="badge ${user.isBlocked ? 'bg-danger' : 'bg-success'}">
              ${user.isBlocked ? 'Blocked' : 'Active'}
            </span>
          </td>
          <td>${formatDate(user.createdAt)}</td>
          <td>
            <button class="btn btn-sm btn-info view-user" data-id="${user._id}">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-warning toggle-block-user" data-id="${user._id}" data-is-blocked="${user.isBlocked}">
              <i class="bi ${user.isBlocked ? 'bi-unlock' : 'bi-lock'}"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-user" data-id="${user._id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        `;
        usersTable.appendChild(row);
      });
      
      // Update pagination
      updatePagination('users-pagination', data.data, loadUsersData);
      
      // Add event listeners to action buttons
      addUserActionListeners();
    }
  })
  .catch(error => {
    console.error('Error loading users:', error);
  });
}

// Load Rides Data
function loadRidesData(page = 1, status = '') {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  // Fetch rides with pagination
  let url = `${API_URL}/rides?page=${page}&limit=10`;
  if (status) {
    url += `&status=${status}`;
  }
  
  fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const ridesTable = document.getElementById('rides-table');
      ridesTable.innerHTML = '';
      
      data.data.docs.forEach(ride => {
        const departureTime = new Date(ride.departureTime);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${ride.driver ? ride.driver.name : 'Unknown'}</td>
          <td class="text-truncate-custom" title="${ride.startLocation.address}">${ride.startLocation.address}</td>
          <td class="text-truncate-custom" title="${ride.endLocation.address}">${ride.endLocation.address}</td>
          <td>${formatDateTime(departureTime)}</td>
          <td>${ride.availableSeats}</td>
          <td>$${ride.fare.toFixed(2)}</td>
          <td>
            <span class="badge bg-${getStatusBadgeClass(ride.status)}">
              ${formatStatus(ride.status)}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-info view-ride" data-id="${ride._id}">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-ride" data-id="${ride._id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        `;
        ridesTable.appendChild(row);
      });
      
      // Update pagination
      updatePagination('rides-pagination', data.data, loadRidesData);
      
      // Add event listeners to action buttons
      addRideActionListeners();
    }
  })
  .catch(error => {
    console.error('Error loading rides:', error);
  });
}

// Load Bookings Data
function loadBookingsData(page = 1, status = '') {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  // Fetch all bookings by fetching them for each ride
  // This is not the most efficient way, but it works for the demo
  // In a real app, you would create a dedicated API endpoint for this
  
  fetch(`${API_URL}/rides?limit=100`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(async ridesData => {
    if (ridesData.success) {
      let allBookings = [];
      let rideMap = {};
      
      // Create a map of ride IDs to ride objects for quick lookup
      ridesData.data.docs.forEach(ride => {
        rideMap[ride._id] = ride;
      });
      
      // Fetch bookings for each ride
      const fetchPromises = ridesData.data.docs.map(ride => 
        fetch(`${API_URL}/bookings/ride/${ride._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => response.json())
        .then(bookingsData => {
          if (bookingsData.success) {
            // Add ride info to each booking
            bookingsData.data.docs.forEach(booking => {
              booking.rideInfo = rideMap[booking.ride];
            });
            
            // Filter by status if specified
            const filteredBookings = status 
              ? bookingsData.data.docs.filter(booking => booking.status === status)
              : bookingsData.data.docs;
              
            allBookings = [...allBookings, ...filteredBookings];
          }
        })
        .catch(error => {
          console.error(`Error fetching bookings for ride ${ride._id}:`, error);
        })
      );
      
      // Wait for all fetch operations to complete
      await Promise.all(fetchPromises);
      
      // Sort bookings by createdAt date (newest first)
      allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Implement simple pagination
      const limit = 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedBookings = allBookings.slice(startIndex, endIndex);
      
      // Get total pages
      const totalPages = Math.ceil(allBookings.length / limit);
      
      // Display bookings
      const bookingsTable = document.getElementById('bookings-table');
      bookingsTable.innerHTML = '';
      
      paginatedBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${booking.rider.name}</td>
          <td>${booking.rideInfo?.driver?.name || 'Unknown'}</td>
          <td class="text-truncate-custom" title="${booking.pickupLocation.address}">${booking.pickupLocation.address}</td>
          <td class="text-truncate-custom" title="${booking.dropLocation.address}">${booking.dropLocation.address}</td>
          <td>${booking.seats}</td>
          <td>$${booking.totalFare.toFixed(2)}</td>
          <td>
            <span class="badge bg-${getStatusBadgeClass(booking.status)}">
              ${formatStatus(booking.status)}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-info view-booking" data-id="${booking._id}">
              <i class="bi bi-eye"></i>
            </button>
          </td>
        `;
        bookingsTable.appendChild(row);
      });
      
      // Create pagination info object
      const paginationInfo = {
        page,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevPage: page - 1,
        nextPage: page + 1
      };
      
      // Update pagination
      const paginationContainer = document.getElementById('bookings-pagination');
      paginationContainer.innerHTML = '';
      
      // Previous page button
      const prevLi = document.createElement('li');
      prevLi.className = `page-item ${!paginationInfo.hasPrevPage ? 'disabled' : ''}`;
      prevLi.innerHTML = `<a class="page-link" href="#" ${paginationInfo.hasPrevPage ? `data-page="${paginationInfo.prevPage}"` : ''}>Previous</a>`;
      paginationContainer.appendChild(prevLi);
      
      // Page links
      for (let i = 1; i <= paginationInfo.totalPages; i++) {
        if (i === 1 || i === paginationInfo.totalPages || (i >= paginationInfo.page - 1 && i <= paginationInfo.page + 1)) {
          const pageLi = document.createElement('li');
          pageLi.className = `page-item ${i === paginationInfo.page ? 'active' : ''}`;
          pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
          paginationContainer.appendChild(pageLi);
        } else if (i === paginationInfo.page - 2 || i === paginationInfo.page + 2) {
          const ellipsisLi = document.createElement('li');
          ellipsisLi.className = 'page-item disabled';
          ellipsisLi.innerHTML = '<a class="page-link" href="#">...</a>';
          paginationContainer.appendChild(ellipsisLi);
        }
      }
      
      // Next page button
      const nextLi = document.createElement('li');
      nextLi.className = `page-item ${!paginationInfo.hasNextPage ? 'disabled' : ''}`;
      nextLi.innerHTML = `<a class="page-link" href="#" ${paginationInfo.hasNextPage ? `data-page="${paginationInfo.nextPage}"` : ''}>Next</a>`;
      paginationContainer.appendChild(nextLi);
      
      // Add pagination event listeners
      paginationContainer.querySelectorAll('.page-link').forEach(link => {
        if (link.dataset.page) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = parseInt(link.dataset.page);
            currentPage.bookings = newPage;
            loadBookingsData(newPage, status);
          });
        }
      });
      
      // Add event listeners to action buttons
      addBookingActionListeners();
    }
  })
  .catch(error => {
    console.error('Error loading bookings:', error);
  });
}

// Update pagination for a given container
function updatePagination(containerId, paginationData, callback) {
  const paginationContainer = document.getElementById(containerId);
  paginationContainer.innerHTML = '';
  
  // Previous page button
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${!paginationData.hasPrevPage ? 'disabled' : ''}`;
  prevLi.innerHTML = `<a class="page-link" href="#" ${paginationData.hasPrevPage ? `data-page="${paginationData.prevPage}"` : ''}>Previous</a>`;
  paginationContainer.appendChild(prevLi);
  
  // Page links
  for (let i = 1; i <= paginationData.totalPages; i++) {
    if (i === 1 || i === paginationData.totalPages || (i >= paginationData.page - 1 && i <= paginationData.page + 1)) {
      const pageLi = document.createElement('li');
      pageLi.className = `page-item ${i === paginationData.page ? 'active' : ''}`;
      pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
      paginationContainer.appendChild(pageLi);
    } else if (i === paginationData.page - 2 || i === paginationData.page + 2) {
      const ellipsisLi = document.createElement('li');
      ellipsisLi.className = 'page-item disabled';
      ellipsisLi.innerHTML = '<a class="page-link" href="#">...</a>';
      paginationContainer.appendChild(ellipsisLi);
    }
  }
  
  // Next page button
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${!paginationData.hasNextPage ? 'disabled' : ''}`;
  nextLi.innerHTML = `<a class="page-link" href="#" ${paginationData.hasNextPage ? `data-page="${paginationData.nextPage}"` : ''}>Next</a>`;
  paginationContainer.appendChild(nextLi);
  
  // Add pagination event listeners
  paginationContainer.querySelectorAll('.page-link').forEach(link => {
    if (link.dataset.page) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const newPage = parseInt(link.dataset.page);
        
        // Update current page
        if (containerId === 'users-pagination') {
          currentPage.users = newPage;
          callback(newPage, document.getElementById('user-role-filter').value);
        } else if (containerId === 'rides-pagination') {
          currentPage.rides = newPage;
          callback(newPage, document.getElementById('ride-status-filter').value);
        }
      });
    }
  });
}

// Add event listeners to user action buttons
function addUserActionListeners() {
  // View user
  document.querySelectorAll('.view-user').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.dataset.id;
      viewUser(userId);
    });
  });
  
  // Toggle block user
  document.querySelectorAll('.toggle-block-user').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.dataset.id;
      const isBlocked = button.dataset.isBlocked === 'true';
      toggleBlockUser(userId, isBlocked);
    });
  });
  
  // Delete user
  document.querySelectorAll('.delete-user').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.dataset.id;
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        deleteUser(userId);
      }
    });
  });
}

// Add event listeners to ride action buttons
function addRideActionListeners() {
  // View ride
  document.querySelectorAll('.view-ride').forEach(button => {
    button.addEventListener('click', () => {
      const rideId = button.dataset.id;
      viewRide(rideId);
    });
  });
  
  // Delete ride
  document.querySelectorAll('.delete-ride').forEach(button => {
    button.addEventListener('click', () => {
      const rideId = button.dataset.id;
      if (confirm('Are you sure you want to delete this ride? This will also delete all associated bookings.')) {
        deleteRide(rideId);
      }
    });
  });
}

// Add event listeners to booking action buttons
function addBookingActionListeners() {
  // View booking
  document.querySelectorAll('.view-booking').forEach(button => {
    button.addEventListener('click', () => {
      const bookingId = button.dataset.id;
      viewBooking(bookingId);
    });
  });
}

// View user details
function viewUser(userId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  fetch(`${API_URL}/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const user = data.data;
      activeItemId = user._id;
      
      // Set user details in modal
      document.getElementById('user-profile-pic').src = user.profilePicture || 'https://via.placeholder.com/100';
      document.getElementById('user-name').textContent = user.name;
      document.getElementById('user-email').textContent = user.email;
      document.getElementById('user-phone').textContent = user.phone;
      document.getElementById('user-role').textContent = capitalizeFirstLetter(user.role);
      document.getElementById('user-status').textContent = user.isBlocked ? 'Blocked' : 'Active';
      document.getElementById('user-created').textContent = formatDate(user.createdAt);
      
      // Update block/unblock button
      const blockButton = document.getElementById('toggle-block-user-btn');
      blockButton.textContent = user.isBlocked ? 'Unblock User' : 'Block User';
      blockButton.className = `btn ${user.isBlocked ? 'btn-success' : 'btn-warning'}`;
      blockButton.onclick = () => toggleBlockUser(user._id, user.isBlocked);
      
      // Show driver details if applicable
      const driverSection = document.getElementById('driver-details-section');
      if (user.role === 'driver' && user.driverDetails) {
        driverSection.classList.remove('d-none');
        document.getElementById('driver-car-model').textContent = user.driverDetails.carModel || 'N/A';
        document.getElementById('driver-car-color').textContent = user.driverDetails.carColor || 'N/A';
        document.getElementById('driver-license-plate').textContent = user.driverDetails.licensePlate || 'N/A';
        document.getElementById('driver-license-number').textContent = user.driverDetails.licenseNumber || 'N/A';
      } else {
        driverSection.classList.add('d-none');
      }
      
      // Show modal
      const userModal = new bootstrap.Modal(document.getElementById('viewUserModal'));
      userModal.show();
    }
  })
  .catch(error => {
    console.error('Error viewing user:', error);
  });
}

// Toggle block/unblock user
function toggleBlockUser(userId, isCurrentlyBlocked) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  fetch(`${API_URL}/users/${userId}/block`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Close modal if open
      const modalElement = document.getElementById('viewUserModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
      
      // Refresh users data
      loadUsersData(currentPage.users, document.getElementById('user-role-filter').value);
      
      // Show success alert
      alert(`User ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully!`);
    }
  })
  .catch(error => {
    console.error('Error toggling user block status:', error);
  });
}

// Delete user
function deleteUser(userId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Refresh users data
      loadUsersData(currentPage.users, document.getElementById('user-role-filter').value);
      
      // Show success alert
      alert('User deleted successfully!');
    }
  })
  .catch(error => {
    console.error('Error deleting user:', error);
  });
}

// View ride details
function viewRide(rideId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  fetch(`${API_URL}/rides/${rideId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const ride = data.data;
      activeItemId = ride._id;
      
      // Set ride details in modal
      document.getElementById('ride-driver').textContent = ride.driver ? ride.driver.name : 'Unknown';
      document.getElementById('ride-from').textContent = ride.startLocation.address;
      document.getElementById('ride-to').textContent = ride.endLocation.address;
      document.getElementById('ride-departure').textContent = formatDateTime(new Date(ride.departureTime));
      document.getElementById('ride-seats').textContent = ride.availableSeats;
      document.getElementById('ride-fare').textContent = `$${ride.fare.toFixed(2)}`;
      document.getElementById('ride-description').textContent = ride.description || 'No description provided';
      document.getElementById('ride-status').textContent = formatStatus(ride.status);
      document.getElementById('ride-created').textContent = formatDate(ride.createdAt);
      
      // Add event listeners to status update buttons
      document.querySelectorAll('.update-ride-status').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const status = link.dataset.status;
          updateRideStatus(ride._id, status);
        });
      });
      
      // Show modal
      const rideModal = new bootstrap.Modal(document.getElementById('viewRideModal'));
      rideModal.show();
    }
  })
  .catch(error => {
    console.error('Error viewing ride:', error);
  });
}

// Update ride status
function updateRideStatus(rideId, status) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  fetch(`${API_URL}/rides/${rideId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Close modal
      const modalElement = document.getElementById('viewRideModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
      
      // Refresh rides data
      loadRidesData(currentPage.rides, document.getElementById('ride-status-filter').value);
      
      // Show success alert
      alert(`Ride status updated to ${formatStatus(status)}!`);
    }
  })
  .catch(error => {
    console.error('Error updating ride status:', error);
  });
}

// Delete ride
function deleteRide(rideId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  fetch(`${API_URL}/rides/${rideId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Refresh rides data
      loadRidesData(currentPage.rides, document.getElementById('ride-status-filter').value);
      
      // Show success alert
      alert('Ride deleted successfully!');
    }
  })
  .catch(error => {
    console.error('Error deleting ride:', error);
  });
}

// View booking details
function viewBooking(bookingId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  fetch(`${API_URL}/bookings/${bookingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const booking = data.data;
      activeItemId = booking._id;
      
      // Set booking details in modal
      document.getElementById('booking-rider').textContent = booking.rider ? booking.rider.name : 'Unknown';
      
      const rideInfo = booking.ride ? 
        `${booking.ride.driver ? booking.ride.driver.name : 'Unknown'} (${booking.ride.startLocation.address} to ${booking.ride.endLocation.address})` 
        : 'Unknown';
      document.getElementById('booking-ride').textContent = rideInfo;
      
      document.getElementById('booking-pickup').textContent = booking.pickupLocation.address;
      document.getElementById('booking-drop').textContent = booking.dropLocation.address;
      document.getElementById('booking-seats').textContent = booking.seats;
      document.getElementById('booking-fare').textContent = `$${booking.totalFare.toFixed(2)}`;
      document.getElementById('booking-status').textContent = formatStatus(booking.status);
      document.getElementById('booking-created').textContent = formatDate(booking.createdAt);
      
      // Add event listeners to status update buttons
      document.querySelectorAll('.update-booking-status').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const status = link.dataset.status;
          updateBookingStatus(booking._id, status);
        });
      });
      
      // Show modal
      const bookingModal = new bootstrap.Modal(document.getElementById('viewBookingModal'));
      bookingModal.show();
    }
  })
  .catch(error => {
    console.error('Error viewing booking:', error);
  });
}

// Update booking status
function updateBookingStatus(bookingId, status) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }
  
  fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Close modal
      const modalElement = document.getElementById('viewBookingModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
      
      // Refresh bookings data
      loadBookingsData(currentPage.bookings, document.getElementById('booking-status-filter').value);
      
      // Show success alert
      alert(`Booking status updated to ${formatStatus(status)}!`);
    }
  })
  .catch(error => {
    console.error('Error updating booking status:', error);
  });
}

// Format date as MM/DD/YYYY
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US');
}

// Format date and time as MM/DD/YYYY, HH:MM AM/PM
function formatDateTime(date) {
  return `${date.toLocaleDateString('en-US')}, ${date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit'
  })}`;
}

// Capitalize first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get badge class for status
function getStatusBadgeClass(status) {
  switch (status) {
    case 'scheduled':
      return 'info';
    case 'in-progress':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'pending':
      return 'warning';
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
}

// Format status text
function formatStatus(status) {
  switch (status) {
    case 'in-progress':
      return 'In Progress';
    default:
      return capitalizeFirstLetter(status);
  }
}

// Event listeners for navigation
dashboardLink.addEventListener('click', (e) => {
  e.preventDefault();
  showDashboard();
  loadDashboardData();
});

usersLink.addEventListener('click', (e) => {
  e.preventDefault();
  showContainer('users-container');
  loadUsersData(currentPage.users);
});

ridesLink.addEventListener('click', (e) => {
  e.preventDefault();
  showContainer('rides-container');
  loadRidesData(currentPage.rides);
});

bookingsLink.addEventListener('click', (e) => {
  e.preventDefault();
  showContainer('bookings-container');
  loadBookingsData(currentPage.bookings);
});

logoutLink.addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

// User filter
document.getElementById('apply-user-filter').addEventListener('click', () => {
  const roleFilter = document.getElementById('user-role-filter').value;
  currentPage.users = 1;
  loadUsersData(1, roleFilter);
});

// Ride filter
document.getElementById('apply-ride-filter').addEventListener('click', () => {
  const statusFilter = document.getElementById('ride-status-filter').value;
  currentPage.rides = 1;
  loadRidesData(1, statusFilter);
});

// Booking filter
document.getElementById('apply-booking-filter').addEventListener('click', () => {
  const statusFilter = document.getElementById('booking-status-filter').value;
  currentPage.bookings = 1;
  loadBookingsData(1, statusFilter);
});

// Refresh buttons
document.getElementById('refresh-users').addEventListener('click', () => {
  loadUsersData(currentPage.users, document.getElementById('user-role-filter').value);
});

document.getElementById('refresh-rides').addEventListener('click', () => {
  loadRidesData(currentPage.rides, document.getElementById('ride-status-filter').value);
});

document.getElementById('refresh-bookings').addEventListener('click', () => {
  loadBookingsData(currentPage.bookings, document.getElementById('booking-status-filter').value);
});

// Check authentication when page loads
document.addEventListener('DOMContentLoaded', checkAuth);