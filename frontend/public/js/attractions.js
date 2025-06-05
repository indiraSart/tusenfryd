document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const attractionCards = document.querySelectorAll('.attraction-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            attractionCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else if (filter === 'open') {
                    card.style.display = card.getAttribute('data-status') === 'open' ? 'block' : 'none';
                } else if (filter === 'short-queue') {
                    const queueTime = parseInt(card.getAttribute('data-queue'));
                    card.style.display = queueTime <= 15 ? 'block' : 'none';
                }
            });
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchAttractions');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            
            attractionCards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                if (name.includes(searchValue)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Check for notifications permission on page load
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            const notificationBanner = document.createElement('div');
            notificationBanner.classList.add('notification-banner');
            notificationBanner.innerHTML = `
                <p>Enable notifications to get updates on attraction closures and queue times</p>
                <button id="enableNotifications" class="btn small-btn">Enable Notifications</button>
            `;
            
            document.body.appendChild(notificationBanner);
            
            document.getElementById('enableNotifications').addEventListener('click', function() {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        notificationBanner.style.display = 'none';
                    }
                });
            });
        }
    }
});
