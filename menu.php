<?php
// Menu data structure
$menuCategories = [
    'appetizers' => [
        'title' => 'Appetizers',
        'items' => [
            ['name' => 'Bruschetta Trio', 'price' => 12.99, 'description' => 'Three varieties: classic tomato, mushroom & truffle, goat cheese & honey'],
            ['name' => 'Crispy Calamari', 'price' => 14.99, 'description' => 'Fresh squid rings with marinara and aioli dipping sauces'],
            ['name' => 'Charcuterie Board', 'price' => 18.99, 'description' => 'Selection of artisanal meats, cheeses, olives, and crackers'],
            ['name' => 'Stuffed Mushrooms', 'price' => 11.99, 'description' => 'Button mushrooms filled with herb cream cheese and breadcrumbs']
        ]
    ],
    'mains' => [
        'title' => 'Main Courses',
        'items' => [
            ['name' => 'Grilled Salmon', 'price' => 26.99, 'description' => 'Atlantic salmon with lemon herb butter, roasted vegetables'],
            ['name' => 'Ribeye Steak', 'price' => 32.99, 'description' => '12oz prime cut with garlic mashed potatoes and seasonal vegetables'],
            ['name' => 'Chicken Parmesan', 'price' => 22.99, 'description' => 'Breaded chicken breast with marinara, mozzarella, and pasta'],
            ['name' => 'Vegetarian Risotto', 'price' => 19.99, 'description' => 'Creamy arborio rice with seasonal vegetables and parmesan'],
            ['name' => 'Fish & Chips', 'price' => 18.99, 'description' => 'Beer-battered cod with hand-cut fries and mushy peas']
        ]
    ],
    'desserts' => [
        'title' => 'Desserts',
        'items' => [
            ['name' => 'Chocolate Lava Cake', 'price' => 8.99, 'description' => 'Warm chocolate cake with molten center, vanilla ice cream'],
            ['name' => 'Tiramisu', 'price' => 7.99, 'description' => 'Classic Italian dessert with coffee-soaked ladyfingers'],
            ['name' => 'Crème Brûlée', 'price' => 8.99, 'description' => 'Vanilla custard with caramelized sugar crust'],
            ['name' => 'Seasonal Fruit Tart', 'price' => 6.99, 'description' => 'Fresh seasonal fruits on pastry cream base']
        ]
    ],
    'beverages' => [
        'title' => 'Beverages',
        'items' => [
            ['name' => 'House Wine', 'price' => 8.99, 'description' => 'Red or white wine selection by the glass'],
            ['name' => 'Craft Beer', 'price' => 6.99, 'description' => 'Local brewery selection, rotating taps'],
            ['name' => 'Artisan Coffee', 'price' => 4.99, 'description' => 'Freshly roasted single-origin beans'],
            ['name' => 'Fresh Juice', 'price' => 4.99, 'description' => 'Orange, apple, or seasonal fruit blend']
        ]
    ]
];

// Get current time for dynamic greeting
$currentHour = date('H');
if ($currentHour < 12) {
    $greeting = 'Good Morning';
} elseif ($currentHour < 17) {
    $greeting = 'Good Afternoon';
} else {
    $greeting = 'Good Evening';
}

// Special of the day (changes based on day of week)
$dayOfWeek = date('w');
$specialsOfDay = [
    0 => 'Sunday Brunch Special - Eggs Benedict with Hollandaise',
    1 => 'Monday Blues Buster - Half Price Appetizers',
    2 => 'Taco Tuesday - Fish Tacos with Mango Salsa',
    3 => 'Wine Wednesday - 25% Off All Wines',
    4 => 'Thursday Throwback - Classic Meatloaf with Gravy',
    5 => 'Friday Fresh - Catch of the Day Market Price',
    6 => 'Saturday Sizzle - Prime Rib Special'
];

$todaysSpecial = $specialsOfDay[$dayOfWeek];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restaurant Menu - Eric's Bistro</title>
    <link rel="icon" type="image/png" href="images/icon.png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            background: rgba(255, 255, 255, 0.95);
            padding: 40px 20px;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            font-size: 3rem;
            color: #2c3e50;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .greeting {
            font-size: 1.2rem;
            color: #7f8c8d;
            margin-bottom: 20px;
        }
        
        .special-banner {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        
        .menu-category {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .menu-category:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }
        
        .category-title {
            font-size: 2rem;
            color: #2c3e50;
            margin-bottom: 25px;
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        
        .menu-item {
            margin-bottom: 25px;
            padding: 20px;
            border-left: 4px solid #3498db;
            background: #f8f9fa;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .menu-item:hover {
            background: #e9ecef;
            border-left-color: #e74c3c;
            transform: translateX(5px);
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .item-name {
            font-size: 1.3rem;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .item-price {
            font-size: 1.2rem;
            color: #e74c3c;
            font-weight: bold;
        }
        
        .item-description {
            color: #7f8c8d;
            font-style: italic;
            line-height: 1.4;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 30px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            color: #7f8c8d;
        }
        
        .back-link {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 25px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 25px;
            transition: all 0.3s ease;
            font-weight: bold;
        }
        
        .back-link:hover {
            background: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        }
        
        .time-display {
            font-size: 1.1rem;
            color: #34495e;
            margin-top: 15px;
        }
        
        @media (max-width: 768px) {
            .menu-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .item-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .item-price {
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍽️ Eric's Bistro</h1>
            <p class="greeting"><?php echo $greeting; ?>! Welcome to our restaurant.</p>
            <div class="time-display">
                Current time: <strong><span id="current-time"></span></strong>
            </div>
            
            <div class="special-banner">
                🌟 Today's Special: <?php echo $todaysSpecial; ?> 🌟
            </div>
        </div>
        
        <div class="menu-grid">
            <?php foreach ($menuCategories as $categoryKey => $category): ?>
            <div class="menu-category">
                <h2 class="category-title"><?php echo $category['title']; ?></h2>
                
                <?php foreach ($category['items'] as $item): ?>
                <div class="menu-item">
                    <div class="item-header">
                        <span class="item-name"><?php echo $item['name']; ?></span>
                        <span class="item-price">$<?php echo number_format($item['price'], 2); ?></span>
                    </div>
                    <p class="item-description"><?php echo $item['description']; ?></p>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endforeach; ?>
        </div>
        
        <div class="footer">
            <p>🕒 Kitchen Hours: 11:00 AM - 10:00 PM Daily</p>
            <p>📞 Reservations: (555) 123-4567</p>
            <p>📍 123 Gourmet Street, Food City, FC 12345</p>
            
            <a href="index.html" class="back-link">← Back to Portfolio</a>
        </div>
    </div>
    
    <script>
        // Update time display
        function updateTime() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('current-time').textContent = timeString;
        }
        
        // Update time every second
        setInterval(updateTime, 1000);
        updateTime();
        
        // Add smooth scroll animation for menu items
        document.addEventListener('DOMContentLoaded', function() {
            const menuItems = document.querySelectorAll('.menu-item');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1
            });
            
            menuItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(item);
            });
        });
    </script>
</body>
</html>