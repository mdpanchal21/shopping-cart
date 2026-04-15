const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const connectDB = require("./config/db");
const Category = require("./model/Category.model");
const Product = require("./model/Product.model");

dotenv.config();

// ========== Image Downloader with redirect support ==========
function downloadImage(url, filePath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error("Too many redirects"));

    const client = url.startsWith("https") ? https : http;

    const request = client.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" } },
      (response) => {
        // Follow redirects
        if ((response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) && response.headers.location) {
          let redirectUrl = response.headers.location;
          if (redirectUrl.startsWith("/")) {
            const parsed = new URL(url);
            redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
          }
          downloadImage(redirectUrl, filePath, maxRedirects - 1).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }

        const file = fs.createWriteStream(filePath);
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(true));
        });
        file.on("error", (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
      }
    );
    request.on("error", reject);
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error("Download timeout"));
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========== SEED DATA ==========

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Clothing", slug: "clothing" },
  { name: "Footwear", slug: "footwear" },
  { name: "Books", slug: "books" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Sports & Fitness", slug: "sports-fitness" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
];

const productsData = {
  electronics: [
    { name: "Wireless Bluetooth Headphones", price: 2499, description: "Premium wireless headphones with noise cancellation and 30-hour battery life.", keyword: "wireless+headphones" },
    { name: "Smart Watch Pro", price: 4999, description: "Feature-rich smartwatch with heart rate monitor, GPS, and AMOLED display.", keyword: "smartwatch" },
    { name: "Portable Power Bank 20000mAh", price: 1299, description: "High capacity power bank with fast charging support and dual USB ports.", keyword: "power+bank" },
    { name: "USB-C Hub 7-in-1", price: 1899, description: "Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and PD charging.", keyword: "usb+hub" },
    { name: "Wireless Mouse Ergonomic", price: 899, description: "Ergonomic wireless mouse with adjustable DPI and silent click technology.", keyword: "wireless+mouse" },
    { name: "Mechanical Keyboard RGB", price: 3499, description: "Full-size mechanical keyboard with Cherry MX switches and customizable RGB lighting.", keyword: "mechanical+keyboard" },
    { name: "Webcam HD 1080p", price: 2199, description: "Full HD webcam with auto-focus, built-in microphone, and privacy shutter.", keyword: "webcam" },
    { name: "Bluetooth Speaker Portable", price: 1799, description: "Waterproof portable Bluetooth speaker with 360-degree sound and 12-hour battery.", keyword: "bluetooth+speaker" },
    { name: "Laptop Stand Adjustable", price: 1499, description: "Aluminum adjustable laptop stand with ventilation and ergonomic height adjustment.", keyword: "laptop+stand" },
    { name: "Wireless Earbuds Pro", price: 3299, description: "True wireless earbuds with ANC, transparency mode, and wireless charging case.", keyword: "wireless+earbuds" },
    { name: "Smart LED Bulb Pack", price: 999, description: "Pack of 3 smart LED bulbs with WiFi control, 16 million colors, and voice assistant support.", keyword: "smart+bulb" },
    { name: "Fast Charger 65W GaN", price: 1599, description: "Ultra-compact 65W GaN charger with USB-C PD and backward compatibility.", keyword: "phone+charger" },
    { name: "External SSD 512GB", price: 4499, description: "Portable external SSD with USB 3.2 Gen 2, up to 1050MB/s read speed.", keyword: "external+ssd" },
    { name: "Digital Alarm Clock", price: 799, description: "Modern digital alarm clock with LED display, dual alarms, and USB charging port.", keyword: "digital+alarm+clock" },
    { name: "Noise Cancelling Earphones", price: 1999, description: "In-ear noise cancelling earphones with premium drivers and tangle-free cable.", keyword: "earphones" },
  ],

  clothing: [
    { name: "Classic Cotton T-Shirt", price: 599, description: "Premium 100% cotton round neck t-shirt available in multiple colors.", keyword: "cotton+tshirt" },
    { name: "Slim Fit Denim Jeans", price: 1499, description: "Comfortable slim fit denim jeans with stretch fabric and modern wash.", keyword: "denim+jeans" },
    { name: "Formal Dress Shirt", price: 1299, description: "Crisp formal shirt in cotton blend with wrinkle-resistant finish.", keyword: "formal+shirt" },
    { name: "Winter Hoodie Pullover", price: 1799, description: "Warm fleece-lined hoodie with kangaroo pocket and adjustable drawstring.", keyword: "hoodie" },
    { name: "Casual Polo Shirt", price: 899, description: "Classic polo shirt with embroidered logo, ribbed collar, and breathable fabric.", keyword: "polo+shirt" },
    { name: "Chino Pants Regular Fit", price: 1199, description: "Versatile chino pants in cotton twill with flat front and tapered leg.", keyword: "chino+pants" },
    { name: "Leather Belt Premium", price: 699, description: "Genuine leather belt with brushed metal buckle, available in black and brown.", keyword: "leather+belt" },
    { name: "Track Pants Slim Fit", price: 899, description: "Comfortable track pants with zip pockets and elastic waistband.", keyword: "track+pants" },
    { name: "Denim Jacket Classic", price: 2299, description: "Classic denim jacket with button closure, chest pockets, and vintage wash.", keyword: "denim+jacket" },
    { name: "Printed Graphic Tee", price: 499, description: "Trendy graphic print t-shirt made from soft cotton with unique designs.", keyword: "graphic+tee" },
    { name: "Linen Casual Shirt", price: 1399, description: "Lightweight linen shirt perfect for summer with roll-up sleeves.", keyword: "linen+shirt" },
    { name: "Wool Blend Sweater", price: 1999, description: "Cozy wool blend crew neck sweater with ribbed cuffs and hem.", keyword: "wool+sweater" },
    { name: "Cargo Shorts Multi-Pocket", price: 999, description: "Durable cargo shorts with multiple utility pockets and belt loops.", keyword: "cargo+shorts" },
    { name: "Cotton Kurta Traditional", price: 799, description: "Traditional cotton kurta with embroidery detail, perfect for festive occasions.", keyword: "kurta" },
    { name: "Rain Jacket Waterproof", price: 2499, description: "Lightweight waterproof rain jacket with sealed seams and packable design.", keyword: "rain+jacket" },
  ],

  footwear: [
    { name: "Running Shoes Lightweight", price: 2999, description: "Lightweight running shoes with responsive cushioning and breathable mesh upper.", keyword: "running+shoes" },
    { name: "Casual Sneakers White", price: 1999, description: "Classic white sneakers with leather upper and comfortable rubber sole.", keyword: "white+sneakers" },
    { name: "Formal Oxford Shoes", price: 3499, description: "Genuine leather Oxford shoes with cap-toe design and leather sole.", keyword: "oxford+shoes" },
    { name: "Sports Sandals Outdoor", price: 1299, description: "Rugged outdoor sandals with adjustable straps and non-slip sole.", keyword: "sport+sandals" },
    { name: "Canvas Slip-On Shoes", price: 899, description: "Comfortable canvas slip-on shoes with elastic gusset and cushioned insole.", keyword: "canvas+shoes" },
    { name: "Hiking Boots Waterproof", price: 4499, description: "Durable waterproof hiking boots with ankle support and Vibram outsole.", keyword: "hiking+boots" },
    { name: "Flip Flops Comfort", price: 399, description: "Comfortable flip flops with arch support and soft EVA foam footbed.", keyword: "flip+flops" },
    { name: "Loafers Leather Brown", price: 2799, description: "Classic brown leather loafers with moccasin stitching and flexible sole.", keyword: "leather+loafers" },
    { name: "Basketball Shoes High-Top", price: 3999, description: "High-top basketball shoes with ankle support and responsive cushioning.", keyword: "basketball+shoes" },
    { name: "Formal Derby Shoes", price: 3299, description: "Polished leather derby shoes with open lacing and Blake stitched sole.", keyword: "derby+shoes" },
    { name: "Training Shoes CrossFit", price: 3499, description: "Versatile training shoes with flat sole and lateral support for CrossFit.", keyword: "training+shoes" },
    { name: "Ethnic Juti Traditional", price: 699, description: "Handcrafted traditional juti with embroidery work and cushioned insole.", keyword: "ethnic+shoes" },
    { name: "Clogs Kitchen Professional", price: 1599, description: "Professional kitchen clogs with anti-slip sole and easy-clean material.", keyword: "clogs+shoes" },
    { name: "Walking Shoes Comfort", price: 2499, description: "Ultra-comfortable walking shoes with memory foam insole and wide fit.", keyword: "walking+shoes" },
    { name: "Chelsea Boots Suede", price: 3799, description: "Stylish suede Chelsea boots with elastic side panel and stacked heel.", keyword: "chelsea+boots" },
  ],

  books: [
    { name: "The Art of Programming", price: 599, description: "Comprehensive guide to modern programming concepts and best practices.", keyword: "programming+book" },
    { name: "JavaScript Mastery Guide", price: 799, description: "In-depth guide covering ES6+, async patterns, and framework essentials.", keyword: "javascript+book" },
    { name: "Data Structures and Algorithms", price: 699, description: "Complete reference for data structures and algorithms with practical examples.", keyword: "algorithm+book" },
    { name: "Machine Learning Basics", price: 899, description: "Introduction to machine learning concepts, algorithms, and real-world applications.", keyword: "machine+learning+book" },
    { name: "System Design Interview", price: 749, description: "Step-by-step guide to ace system design interviews with real examples.", keyword: "system+design+book" },
    { name: "Clean Code Handbook", price: 549, description: "Essential guide to writing clean, maintainable, and efficient code.", keyword: "coding+book" },
    { name: "React.js in Action", price: 849, description: "Practical guide to building modern web applications with React.js.", keyword: "react+programming" },
    { name: "Python for Beginners", price: 499, description: "Beginner-friendly guide to Python programming with hands-on exercises.", keyword: "python+book" },
    { name: "Database Design Fundamentals", price: 649, description: "Comprehensive guide to relational and NoSQL database design principles.", keyword: "database+book" },
    { name: "DevOps Handbook", price: 899, description: "Practical guide to implementing DevOps practices and CI/CD pipelines.", keyword: "devops+book" },
    { name: "Cloud Computing Essentials", price: 799, description: "Guide to cloud architecture, AWS, Azure, and Google Cloud services.", keyword: "cloud+computing" },
    { name: "Cybersecurity Fundamentals", price: 749, description: "Essential guide to network security, encryption, and threat prevention.", keyword: "cybersecurity+book" },
    { name: "Mobile App Development", price: 699, description: "Complete guide to building cross-platform mobile apps with React Native.", keyword: "mobile+development" },
    { name: "Web Design Principles", price: 549, description: "Guide to responsive web design, UX principles, and modern CSS techniques.", keyword: "web+design+book" },
    { name: "Artificial Intelligence Primer", price: 999, description: "Comprehensive introduction to AI concepts, neural networks, and deep learning.", keyword: "artificial+intelligence" },
  ],

  "home-kitchen": [
    { name: "Non-Stick Cookware Set 5pcs", price: 2999, description: "Premium 5-piece non-stick cookware set with tempered glass lids and cool-touch handles.", keyword: "cookware+set" },
    { name: "Electric Kettle 1.5L", price: 1299, description: "Stainless steel electric kettle with auto shut-off and boil-dry protection.", keyword: "electric+kettle" },
    { name: "Knife Set with Block", price: 1899, description: "Professional 6-piece knife set with wooden block and high-carbon stainless steel blades.", keyword: "knife+set" },
    { name: "Bed Sheet Set Cotton King", price: 1499, description: "300 thread count cotton bed sheet set with 2 pillow covers, king size.", keyword: "bed+sheet+set" },
    { name: "LED Table Lamp Dimmable", price: 999, description: "Modern LED table lamp with touch dimming, 3 color modes, and USB charging.", keyword: "table+lamp" },
    { name: "Vacuum Cleaner Handheld", price: 3499, description: "Cordless handheld vacuum cleaner with HEPA filter and 30-min runtime.", keyword: "vacuum+cleaner" },
    { name: "Coffee Maker Drip 12-Cup", price: 2499, description: "Programmable 12-cup drip coffee maker with thermal carafe and auto brew.", keyword: "coffee+maker" },
    { name: "Dinner Set Ceramic 18pcs", price: 2799, description: "Elegant 18-piece ceramic dinner set with floral pattern, microwave safe.", keyword: "dinner+set" },
    { name: "Storage Container Set 10pcs", price: 899, description: "Airtight food storage container set with snap-lock lids, BPA free.", keyword: "food+container" },
    { name: "Wall Clock Decorative", price: 749, description: "Modern decorative wall clock with silent quartz movement and large numbers.", keyword: "wall+clock" },
    { name: "Cushion Covers Set of 5", price: 599, description: "Velvet cushion covers set of 5 with zipper closure and vibrant colors.", keyword: "cushion+covers" },
    { name: "Mixer Grinder 750W", price: 2999, description: "Powerful 750W mixer grinder with 3 stainless steel jars and overload protection.", keyword: "mixer+grinder" },
    { name: "Bathroom Organizer Rack", price: 1199, description: "Wall-mounted bathroom organizer with multiple shelves and towel bar.", keyword: "bathroom+organizer" },
    { name: "Scented Candle Gift Set", price: 699, description: "Set of 4 soy wax scented candles with natural essential oils and cotton wicks.", keyword: "scented+candle" },
    { name: "Iron Box Steam Press", price: 1799, description: "Steam iron with ceramic soleplate, variable steam, and anti-drip feature.", keyword: "steam+iron" },
  ],

  "sports-fitness": [
    { name: "Yoga Mat Premium 6mm", price: 999, description: "Non-slip premium yoga mat with alignment lines and carrying strap.", keyword: "yoga+mat" },
    { name: "Dumbbell Set Adjustable 20kg", price: 3499, description: "Adjustable dumbbell set with rubber-coated plates and chrome handle.", keyword: "dumbbell+set" },
    { name: "Resistance Bands Set 5pcs", price: 699, description: "Set of 5 resistance bands with different tension levels and door anchor.", keyword: "resistance+bands" },
    { name: "Skipping Rope Digital Counter", price: 499, description: "Speed skipping rope with digital counter, adjustable length, and foam handles.", keyword: "skipping+rope" },
    { name: "Gym Bag Duffle Large", price: 1299, description: "Large duffle gym bag with shoe compartment, wet pocket, and adjustable strap.", keyword: "gym+bag" },
    { name: "Protein Shaker Bottle 700ml", price: 349, description: "Leak-proof protein shaker bottle with mixing ball and measurement markings.", keyword: "shaker+bottle" },
    { name: "Push-Up Board Multi-Function", price: 899, description: "Color-coded push-up board with multiple positions for targeted muscle training.", keyword: "pushup+board" },
    { name: "Cricket Bat English Willow", price: 4999, description: "Grade A English Willow cricket bat with premium grip and optimal balance.", keyword: "cricket+bat" },
    { name: "Football Official Size 5", price: 999, description: "FIFA quality match football with thermal bonded panels and butyl bladder.", keyword: "football" },
    { name: "Badminton Racket Pair", price: 1499, description: "Lightweight badminton racket set of 2 with shuttlecocks and carrying bag.", keyword: "badminton+racket" },
    { name: "Gym Gloves with Wrist Support", price: 599, description: "Padded gym gloves with wrist wrap support and anti-slip palm grip.", keyword: "gym+gloves" },
    { name: "Ab Roller Wheel", price: 799, description: "Dual wheel ab roller with ergonomic handles and knee pad included.", keyword: "ab+roller" },
    { name: "Sports Water Bottle 1L Insulated", price: 699, description: "Double-wall insulated stainless steel sports bottle, keeps cold 24 hours.", keyword: "sports+water+bottle" },
    { name: "Tennis Balls Pack of 3", price: 399, description: "ITF approved pressurized tennis balls with consistent bounce and durability.", keyword: "tennis+balls" },
    { name: "Fitness Tracker Band", price: 1999, description: "Waterproof fitness tracker with step counter, sleep monitor, and heart rate sensor.", keyword: "fitness+tracker" },
  ],

  "beauty-personal-care": [
    { name: "Face Wash Gel Cleanser", price: 349, description: "Gentle gel face wash with salicylic acid for deep cleansing and oil control.", keyword: "face+wash" },
    { name: "Moisturizer SPF 30 Day Cream", price: 599, description: "Lightweight day moisturizer with SPF 30 protection and vitamin E.", keyword: "moisturizer+cream" },
    { name: "Hair Dryer Professional 2200W", price: 2499, description: "Professional ionic hair dryer with 3 heat settings and concentrator nozzle.", keyword: "hair+dryer" },
    { name: "Beard Trimmer Rechargeable", price: 1499, description: "Cordless beard trimmer with 20 length settings and titanium blades.", keyword: "beard+trimmer" },
    { name: "Sunscreen Lotion SPF 50", price: 449, description: "Broad spectrum SPF 50 sunscreen with PA+++ and non-greasy formula.", keyword: "sunscreen+lotion" },
    { name: "Shampoo Anti-Dandruff 300ml", price: 299, description: "Anti-dandruff shampoo with zinc pyrithione and tea tree oil.", keyword: "shampoo+bottle" },
    { name: "Perfume Eau De Toilette 100ml", price: 1999, description: "Long-lasting eau de toilette with woody and citrus notes, 100ml.", keyword: "perfume+bottle" },
    { name: "Hair Straightener Ceramic", price: 1799, description: "Ceramic plate hair straightener with adjustable temperature up to 230C.", keyword: "hair+straightener" },
    { name: "Body Lotion Cocoa Butter 400ml", price: 399, description: "Rich cocoa butter body lotion for deep hydration and smooth skin.", keyword: "body+lotion" },
    { name: "Electric Toothbrush Sonic", price: 1299, description: "Sonic electric toothbrush with 5 modes, 2-min timer, and 2 brush heads.", keyword: "electric+toothbrush" },
    { name: "Lip Balm Set Natural 3pcs", price: 249, description: "Set of 3 natural lip balms with beeswax, cocoa butter, and vitamin E.", keyword: "lip+balm" },
    { name: "Face Serum Vitamin C 30ml", price: 699, description: "Brightening vitamin C serum with hyaluronic acid and ferulic acid.", keyword: "face+serum" },
    { name: "Nail Paint Set 6 Colors", price: 499, description: "Quick-dry nail polish set in 6 trendy colors with glossy finish.", keyword: "nail+polish" },
    { name: "Makeup Brush Set 12pcs", price: 899, description: "Professional 12-piece makeup brush set with synthetic bristles and leather case.", keyword: "makeup+brushes" },
    { name: "Deodorant Roll-On Fresh 50ml", price: 199, description: "48-hour protection roll-on deodorant with fresh aqua fragrance.", keyword: "deodorant" },
  ],
};

// ========== MAIN SEED FUNCTION ==========
async function seed() {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Ensure uploads/products directory exists
    const uploadDir = path.join(__dirname, "uploads", "products");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean existing product images
    const existingFiles = fs.readdirSync(uploadDir);
    for (const file of existingFiles) {
      fs.unlinkSync(path.join(uploadDir, file));
    }
    console.log("🗑️  Cleared existing product images");

    // Delete all existing data
    await Product.deleteMany({});
    console.log("🗑️  Deleted all existing products");

    await Category.deleteMany({});
    console.log("🗑️  Deleted all existing categories");

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories:`);
    createdCategories.forEach((cat) => console.log(`   - ${cat.name} (${cat._id})`));

    // Create products with REAL images for each category
    let totalProducts = 0;
    let totalImages = 0;
    let failedImages = 0;

    for (let i = 0; i < createdCategories.length; i++) {
      const cat = createdCategories[i];
      const products = productsData[cat.slug];

      if (!products) {
        console.log(`⚠️  No products data for slug: ${cat.slug}`);
        continue;
      }

      const productDocs = [];

      for (let j = 0; j < products.length; j++) {
        const prod = products[j];

        // Generate filename (same format as multer)
        const date = new Date().toISOString().slice(0, 10);
        const safeName = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const fileName = `${date}_${safeName}.jpg`;
        const filePath = path.join(uploadDir, fileName);

        // Download real image from loremflickr (free, no API key needed)
        const lockId = i * 100 + j; // unique lock per product for unique images
        const imageUrl = `https://loremflickr.com/400/400/${prod.keyword}?lock=${lockId}`;

        let downloaded = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await downloadImage(imageUrl, filePath);
            // Verify file was actually written and has content
            const stats = fs.statSync(filePath);
            if (stats.size > 500) {
              downloaded = true;
              break;
            }
          } catch (err) {
            if (attempt === 3) {
              console.log(`   ⚠️  Failed to download image for "${prod.name}" after 3 attempts: ${err.message}`);
            }
          }
          await delay(300);
        }

        if (downloaded) {
          totalImages++;
        } else {
          failedImages++;
          // If download failed completely, skip this but still create product without image issue
          // Write a minimal fallback JPG
          try {
            const fallbackUrl = `https://placehold.co/400x400/333/fff/jpg?text=${encodeURIComponent(prod.name.substring(0, 20))}`;
            await downloadImage(fallbackUrl, filePath);
            totalImages++;
          } catch (e) {
            console.log(`   ❌  Fallback also failed for "${prod.name}"`);
          }
        }

        productDocs.push({
          name: prod.name,
          price: prod.price,
          description: prod.description,
          image: [`/uploads/products/${fileName}`],
          category: cat._id,
          isActive: true,
        });

        // Small delay between downloads to avoid rate limiting
        await delay(250);
      }

      await Product.insertMany(productDocs);
      totalProducts += productDocs.length;
      console.log(`✅ Created ${productDocs.length} products for "${cat.name}" with real images`);
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Images downloaded: ${totalImages}`);
    if (failedImages > 0) {
      console.log(`   Failed images: ${failedImages} (used fallback)`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
