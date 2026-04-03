import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { PrismaClient, ProductStatus, UserRole } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

type SeedCategory = {
  categoryName: string;
  description: string;
};

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  inventory: number;
  imageUrl: string;
  featured: boolean;
  status: ProductStatus;
  categoryName: string;
};

const categories: SeedCategory[] = [
  {
    categoryName: "Executive Essentials",
    description: "Premium office-ready gear and accessories for modern professionals.",
  },
  {
    categoryName: "Precision Tech",
    description: "High-performance devices engineered for smooth work and everyday flow.",
  },
  {
    categoryName: "Home Studio",
    description: "Minimal desk, decor, and lighting products for a refined setup.",
  },
];

const withCategory = (
  categoryName: string,
  items: Array<Omit<SeedProduct, "sku" | "status" | "categoryName">>,
): SeedProduct[] =>
  items.map((item, index) => ({
    ...item,
    sku: `${categoryName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    status: ProductStatus.ACTIVE,
    categoryName,
  }));

const products: SeedProduct[] = [
  ...withCategory("Executive Essentials", [
    {
      name: "Carbon Ledger Backpack",
      slug: "carbon-ledger-backpack",
      description:
        "Structured commuter backpack with padded laptop sleeve and quick-access essentials pocket.",
      price: 129.99,
      inventory: 18,
      imageUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Aureon Smart Folio",
      slug: "aureon-smart-folio",
      description:
        "Magnetic tablet folio with modular stand and premium vegan leather finish.",
      price: 89.0,
      inventory: 26,
      imageUrl:
        "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Meridian Briefcase",
      slug: "meridian-briefcase",
      description:
        "Slim structured briefcase with dual compartments for contracts, charger, and daily gear.",
      price: 168.0,
      inventory: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Sterling Card Sleeve",
      slug: "sterling-card-sleeve",
      description:
        "Minimal card wallet with brushed metal shell and RFID-safe interior lining.",
      price: 42.0,
      inventory: 48,
      imageUrl:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Atlas Travel Organizer",
      slug: "atlas-travel-organizer",
      description:
        "Fold-flat organizer for passports, charging cables, pens, and boarding essentials.",
      price: 58.0,
      inventory: 34,
      imageUrl:
        "https://images.unsplash.com/photo-1516557070061-c3d1653fa646?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Summit Carry Pouch",
      slug: "summit-carry-pouch",
      description:
        "Soft-shell accessories pouch with internal dividers for earbuds, dongles, and keys.",
      price: 36.0,
      inventory: 41,
      imageUrl:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Boardroom Pen Set",
      slug: "boardroom-pen-set",
      description:
        "Weighted pen trio with satin finish and precision tips for notes and signatures.",
      price: 64.0,
      inventory: 29,
      imageUrl:
        "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Quiet Hour Notebook",
      slug: "quiet-hour-notebook",
      description:
        "Clothbound dotted notebook designed for meeting notes, planning, and quick sketches.",
      price: 24.0,
      inventory: 60,
      imageUrl:
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Heritage Desk Mat",
      slug: "heritage-desk-mat",
      description:
        "Wide vegan leather desk mat that softens mouse movement and keeps surfaces pristine.",
      price: 52.0,
      inventory: 33,
      imageUrl:
        "https://picsum.photos/seed/heritage-desk-mat/900/900",
      featured: false,
    },
    {
      name: "Linen Cable Portfolio",
      slug: "linen-cable-portfolio",
      description:
        "Fabric-lined folio for chargers, adapters, pens, and small presentation tools.",
      price: 47.0,
      inventory: 27,
      imageUrl:
        "https://images.unsplash.com/photo-1516382799247-87df95d790b7?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Northbound Garment Weekender",
      slug: "northbound-garment-weekender",
      description:
        "Travel bag with garment sleeve section and polished carry handles for overnight trips.",
      price: 194.0,
      inventory: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Ember Passport Wallet",
      slug: "ember-passport-wallet",
      description:
        "Travel wallet with passport sleeve, SIM card holder, and hidden cash pocket.",
      price: 54.0,
      inventory: 31,
      imageUrl:
        "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Slate Valet Tray",
      slug: "slate-valet-tray",
      description:
        "Compact entry tray for cards, watch, and everyday accessories in one tidy drop zone.",
      price: 39.0,
      inventory: 37,
      imageUrl:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Executive Laptop Sleeve",
      slug: "executive-laptop-sleeve",
      description:
        "Structured sleeve with soft microfiber lining and hidden document pocket.",
      price: 72.0,
      inventory: 24,
      imageUrl:
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Axis Bottle Flask",
      slug: "axis-bottle-flask",
      description:
        "Insulated steel bottle with matte finish that keeps coffee or water at the right temperature.",
      price: 34.0,
      inventory: 52,
      imageUrl:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Reserve Key Holder",
      slug: "reserve-key-holder",
      description:
        "Compact leather key wrap with silent carry design and snap-lock closure.",
      price: 28.0,
      inventory: 44,
      imageUrl:
        "https://picsum.photos/seed/reserve-key-holder/900/900",
      featured: false,
    },
    {
      name: "Concierge Tech Case",
      slug: "concierge-tech-case",
      description:
        "Travel-ready organizer with mesh pockets sized for power banks and short cables.",
      price: 49.0,
      inventory: 28,
      imageUrl:
        "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Prospect Messenger",
      slug: "prospect-messenger",
      description:
        "Urban messenger bag with document sleeve, padded strap, and weather-safe canvas shell.",
      price: 138.0,
      inventory: 16,
      imageUrl:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Signature Business Tote",
      slug: "signature-business-tote",
      description:
        "Elegant everyday tote with zip top, dedicated laptop section, and reinforced base.",
      price: 156.0,
      inventory: 14,
      imageUrl:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Regent Document Case",
      slug: "regent-document-case",
      description:
        "Clean zip document case for contracts, tablets, and daily presentation essentials.",
      price: 78.0,
      inventory: 23,
      imageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Monarch Travel Wallet",
      slug: "monarch-travel-wallet",
      description:
        "Full-length wallet with organized slots for currency, cards, tickets, and receipts.",
      price: 62.0,
      inventory: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
  ]),
  ...withCategory("Precision Tech", [
    {
      name: "Velocity Wireless Keyboard",
      slug: "velocity-wireless-keyboard",
      description:
        "Low-profile mechanical keyboard tuned for long sessions and clean desk setups.",
      price: 149.5,
      inventory: 14,
      imageUrl:
        "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Vector Noise Cancel Earbuds",
      slug: "vector-noise-cancel-earbuds",
      description:
        "Compact audio companion with adaptive cancellation and fast pairing.",
      price: 159.0,
      inventory: 28,
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Orbit Precision Mouse",
      slug: "orbit-precision-mouse",
      description:
        "Ergonomic wireless mouse with silent clicks, tracking presets, and USB-C charging.",
      price: 84.0,
      inventory: 32,
      imageUrl:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Flux USB-C Dock",
      slug: "flux-usb-c-dock",
      description:
        "Seven-port aluminum dock with HDMI, Ethernet, SD, and fast-charging passthrough.",
      price: 119.0,
      inventory: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Nova Webcam Pro",
      slug: "nova-webcam-pro",
      description:
        "Sharp 4K webcam with low-light correction and slide-away privacy shutter.",
      price: 129.0,
      inventory: 19,
      imageUrl:
        "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Halo Monitor Light",
      slug: "halo-monitor-light",
      description:
        "Screen-mounted task light that brightens the desk without adding screen glare.",
      price: 68.0,
      inventory: 27,
      imageUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Quantum Portable SSD",
      slug: "quantum-portable-ssd",
      description:
        "Fast pocket-sized SSD for edits, backups, and transfer-heavy creative work.",
      price: 139.0,
      inventory: 22,
      imageUrl:
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Arc Stand Charger",
      slug: "arc-stand-charger",
      description:
        "Wireless charging stand with elevated viewing angle for desks and nightstands.",
      price: 58.0,
      inventory: 36,
      imageUrl:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Atlas 4K Display Hub",
      slug: "atlas-4k-display-hub",
      description:
        "Compact display hub for dual monitors, accessories, and desk simplification.",
      price: 149.0,
      inventory: 17,
      imageUrl:
        "https://picsum.photos/seed/atlas-4k-display-hub/900/900",
      featured: false,
    },
    {
      name: "Pulse Creator Mic",
      slug: "pulse-creator-mic",
      description:
        "USB condenser microphone with desktop stand and clear speech tuning for meetings.",
      price: 112.0,
      inventory: 23,
      imageUrl:
        "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Aero Cooling Pad",
      slug: "aero-cooling-pad",
      description:
        "Slim ventilated laptop stand with adjustable fan settings and cable-friendly frame.",
      price: 74.0,
      inventory: 29,
      imageUrl:
        "https://picsum.photos/seed/aero-cooling-pad/900/900",
      featured: false,
    },
    {
      name: "Prism Stylus Pen",
      slug: "prism-stylus-pen",
      description:
        "Pressure-sensitive stylus with magnetic charging for tablets and sketch workflows.",
      price: 96.0,
      inventory: 26,
      imageUrl:
        "https://picsum.photos/seed/prism-stylus-pen/900/900",
      featured: false,
    },
    {
      name: "Cipher Number Pad",
      slug: "cipher-number-pad",
      description:
        "Wireless keypad for spreadsheets and finance work with tactile responsive keys.",
      price: 49.0,
      inventory: 31,
      imageUrl:
        "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Beacon Smart Speaker",
      slug: "beacon-smart-speaker",
      description:
        "Room-filling compact speaker with balanced voice clarity and wireless streaming.",
      price: 92.0,
      inventory: 24,
      imageUrl:
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Delta GaN Charger",
      slug: "delta-gan-charger",
      description:
        "High-speed compact wall charger with multi-device output for travel kits.",
      price: 44.0,
      inventory: 38,
      imageUrl:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Frame Magnetic Battery",
      slug: "frame-magnetic-battery",
      description:
        "Snap-on power bank with slim profile and enough charge for a full workday top-up.",
      price: 64.0,
      inventory: 33,
      imageUrl:
        "https://picsum.photos/seed/frame-magnetic-battery/900/900",
      featured: false,
    },
    {
      name: "Zenith Streaming Camera",
      slug: "zenith-streaming-camera",
      description:
        "Wide-angle content camera with fast autofocus and natural color output.",
      price: 174.0,
      inventory: 13,
      imageUrl:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Echo Conference Speaker",
      slug: "echo-conference-speaker",
      description:
        "Portable speakerphone tuned for calls with clear pickup and balanced playback.",
      price: 88.0,
      inventory: 21,
      imageUrl:
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Circuit Travel Adapter",
      slug: "circuit-travel-adapter",
      description:
        "Universal travel adapter with USB charging ports and compact slide-lock design.",
      price: 39.0,
      inventory: 40,
      imageUrl:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Pixel Tablet Stand",
      slug: "pixel-tablet-stand",
      description:
        "Weighted aluminum stand that keeps tablets steady for calls, notes, and recipes.",
      price: 53.0,
      inventory: 34,
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Lattice Ethernet Hub",
      slug: "lattice-ethernet-hub",
      description:
        "Desktop hub with fast Ethernet, USB expansion, and a compact brushed-metal body.",
      price: 82.0,
      inventory: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
  ]),
  ...withCategory("Home Studio", [
    {
      name: "Signal Desk Lamp",
      slug: "signal-desk-lamp",
      description:
        "Warm ambient lamp with touch dimming and sculpted aluminum body.",
      price: 74.0,
      inventory: 35,
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Pulse Monitor Stand",
      slug: "pulse-monitor-stand",
      description:
        "Elevated display stand with integrated cable routing and storage tray.",
      price: 99.0,
      inventory: 21,
      imageUrl:
        "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Bloom Ceramic Planter",
      slug: "bloom-ceramic-planter",
      description:
        "Textured ceramic planter that adds a quiet organic accent to shelves and desks.",
      price: 34.0,
      inventory: 32,
      imageUrl:
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Drift Acoustic Panel Set",
      slug: "drift-acoustic-panel-set",
      description:
        "Fabric acoustic tiles designed to soften echo in compact work and recording spaces.",
      price: 124.0,
      inventory: 16,
      imageUrl:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Haven Wool Throw",
      slug: "haven-wool-throw",
      description:
        "Soft textured throw that adds comfort and warmth to a lounge corner or reading chair.",
      price: 68.0,
      inventory: 24,
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Muse Scent Diffuser",
      slug: "muse-scent-diffuser",
      description:
        "Quiet tabletop diffuser with matte finish and subtle ambient light for calm rooms.",
      price: 52.0,
      inventory: 29,
      imageUrl:
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Frame Wall Clock",
      slug: "frame-wall-clock",
      description:
        "Minimal wall clock with silent movement and brushed edge detail.",
      price: 61.0,
      inventory: 22,
      imageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Cedar Shelf Duo",
      slug: "cedar-shelf-duo",
      description:
        "Two-piece floating shelf set for books, decor, and small studio accents.",
      price: 86.0,
      inventory: 18,
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Minimal Task Stool",
      slug: "minimal-task-stool",
      description:
        "Compact upholstered stool that fits neatly into creative corners and small rooms.",
      price: 118.0,
      inventory: 11,
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Ambient Floor Lamp",
      slug: "ambient-floor-lamp",
      description:
        "Tall soft-glow floor lamp with diffused shade for warmer evening lighting.",
      price: 139.0,
      inventory: 14,
      imageUrl:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Cloud Seat Cushion",
      slug: "cloud-seat-cushion",
      description:
        "Supportive memory foam seat cushion that makes long work sessions noticeably easier.",
      price: 46.0,
      inventory: 36,
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Grove Cable Tray",
      slug: "grove-cable-tray",
      description:
        "Under-desk cable tray that hides adapters, strips, and long charger runs.",
      price: 42.0,
      inventory: 31,
      imageUrl:
        "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Atelier Pinboard",
      slug: "atelier-pinboard",
      description:
        "Soft-finish wall board for mood notes, references, and weekly planning cards.",
      price: 58.0,
      inventory: 19,
      imageUrl:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Balance Laptop Riser",
      slug: "balance-laptop-riser",
      description:
        "Fold-flat riser that improves posture while keeping airflow open underneath devices.",
      price: 49.0,
      inventory: 33,
      imageUrl:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Harbor Storage Basket",
      slug: "harbor-storage-basket",
      description:
        "Woven storage basket that keeps cables, notebooks, and accessories out of sight.",
      price: 37.0,
      inventory: 28,
      imageUrl:
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Terra Side Table",
      slug: "terra-side-table",
      description:
        "Compact side table with rounded edges and a clean surface for lamp or books.",
      price: 128.0,
      inventory: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
    {
      name: "Nimbus Desk Shelf",
      slug: "nimbus-desk-shelf",
      description:
        "Tiered shelf organizer that lifts displays and frees up space for notebooks and tools.",
      price: 84.0,
      inventory: 21,
      imageUrl:
        "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=900&q=80",
      featured: true,
    },
    {
      name: "Studio Glass Vase",
      slug: "studio-glass-vase",
      description:
        "Clear sculpted vase for dried stems and minimal shelf styling.",
      price: 33.0,
      inventory: 26,
      imageUrl:
        "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80",
      featured: false,
    },
  ]),
];

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin@123", 12);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 12);

  await prisma.user.upsert({
    where: { email: "admin@aureon.com" },
    update: {
      fullName: "Admin User",
      phone: "9876543210",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: true,
    },
    create: {
      fullName: "Admin User",
      email: "admin@aureon.com",
      phone: "9876543210",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@aureon.com" },
    update: {
      fullName: "Aureon Customer",
      phone: "9123456789",
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      status: true,
    },
    create: {
      fullName: "Aureon Customer",
      email: "customer@aureon.com",
      phone: "9123456789",
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      status: true,
    },
  });

  const categoryMap = new Map<string, number>();

  for (const category of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: { categoryName: category.categoryName },
    });

    const savedCategory = existingCategory
      ? await prisma.category.update({
          where: { categoryId: existingCategory.categoryId },
          data: {
            description: category.description,
            status: true,
          },
        })
      : await prisma.category.create({
          data: category,
        });

    categoryMap.set(savedCategory.categoryName, savedCategory.categoryId);
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        inventory: product.inventory,
        imageUrl: product.imageUrl,
        featured: product.featured,
        status: product.status,
        categoryId: categoryMap.get(product.categoryName)!,
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        price: product.price,
        inventory: product.inventory,
        imageUrl: product.imageUrl,
        featured: product.featured,
        status: product.status,
        categoryId: categoryMap.get(product.categoryName)!,
      },
    });
  }
}

main()
  .then(async () => {
    const totalProducts = await prisma.product.count();
    await prisma.$disconnect();
    console.log(`Database seeded successfully with ${totalProducts} products`);
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
