import React, { createContext, useContext, useState, useEffect } from 'react';

const AppSettingsContext = createContext();

export const GOVERNORATES = {
  ar: [
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'القليوبية',
    'الدقهلية',
    'الشرقية',
    'المنوفية',
    'الغربية',
    'البحيرة',
    'دمياط',
    'كفر الشيخ',
    'بورسعيد',
    'الإسماعيلية',
    'السويس',
    'شمال سيناء',
    'جنوب سيناء',
    'بني سويف',
    'الفيوم',
    'المنيا',
    'أسيوط',
    'سوهاج',
    'قنا',
    'الأقصر',
    'أسوان',
    'البحر الأحمر',
    'الوادي الجديد',
    'مطروح'
  ],
  en: [
    'Cairo',
    'Giza',
    'Alexandria',
    'Qalyubia',
    'Dakahlia',
    'Sharqia',
    'Monufia',
    'Gharbia',
    'Beheira',
    'Damietta',
    'Kafr El Sheikh',
    'Port Said',
    'Ismailia',
    'Suez',
    'North Sinai',
    'South Sinai',
    'Beni Suef',
    'Fayoum',
    'Minya',
    'Asyut',
    'Sohag',
    'Qena',
    'Luxor',
    'Aswan',
    'Red Sea',
    'New Valley',
    'Matrouh'
  ]
};

// Full bilingual dictionary for perfumes
export const PERFUME_TRANSLATIONS = {
  'bianco-latte': {
    name: { ar: 'بيانكو لاتيه', en: 'Bianco Latte' },
    tagline: { ar: 'لمسة كراميل وفانيليا نقية', en: 'A Touch of Pure Caramel & Vanilla' },
    description: {
      ar: 'توليفة دافئة آسرة تجمع بين حلاوة الكراميل ونقاء الفانيليا المعتقة مع لمسات حليبية ناعمة تمنحك إحساساً ملكياً لا يُنسى.',
      en: 'A captivating, warm composition blending rich caramel and matured vanilla with silky sweet cream for an unforgettable royal aura.'
    },
    top_notes: {
      ar: ['كراميل', 'عسل نقي'],
      en: ['Caramel', 'Pure Honey']
    },
    heart_notes: {
      ar: ['فانيليا فرنسية', 'كومارين'],
      en: ['French Vanilla', 'Coumarin']
    },
    base_notes: {
      ar: ['مسك أبيض', 'حبوب الفانيليا المعتقة'],
      en: ['White Musk', 'Matured Vanilla Pods']
    },
    gender: { ar: 'للجنسين', en: 'Unisex' }
  },
  'invictus-elixir': {
    name: { ar: 'انفيكتوس اليكسير', en: 'Invictus Elixir' },
    tagline: { ar: 'أسطورة القوة والفوحان', en: 'The Legend of Intense Victory' },
    description: {
      ar: 'إكسير مكثف غامض يدمج أخشاب العنبر العميقة بالتوابل الحارة، صُمم للشخصيات القيادية التي تبحث عن أثر دائم.',
      en: 'An intense elixir fusing deep amberwoods and rare spices, crafted for commanding presences that leave a lasting mark.'
    },
    top_notes: {
      ar: ['هيل غواتيمالي', 'فلفل أسود'],
      en: ['Guatemalan Cardamom', 'Black Pepper']
    },
    heart_notes: {
      ar: ['بخور ملكي', 'باتشولي معتق'],
      en: ['Royal Incense', 'Aged Patchouli']
    },
    base_notes: {
      ar: ['فانيليا سوداء', 'حبوب التونكا'],
      en: ['Black Vanilla', 'Tonka Bean']
    },
    gender: { ar: 'رجالي', en: 'Men' }
  },
  'erba-pura': {
    name: { ar: 'ايربابورا', en: 'Erba Pura' },
    tagline: { ar: 'سلة فواكه البحر المتوسط النادرة', en: 'Rare Mediterranean Fruit Basket' },
    description: {
      ar: 'انفجار من الانتعاش الفاكهي الراقي ممزوج بمسك أبيض نقي وعنبر دافئ، يضفي إشراقاً وسحراً استثنائياً يدوم طوال اليوم.',
      en: 'A radiant explosion of Mediterranean fruits woven with immaculate white musk and warm amber for all-day sublime projection.'
    },
    top_notes: {
      ar: ['برغموت كالابريا', 'برتقال صقلي', 'ليمون'],
      en: ['Calabrian Bergamot', 'Sicilian Orange', 'Lemon']
    },
    heart_notes: {
      ar: ['فواكه استوائية نادرة'],
      en: ['Rare Exotic Fruits']
    },
    base_notes: {
      ar: ['مسك أبيض ملكي', 'عنبر مدغشقر', 'فانيليا'],
      en: ['Royal White Musk', 'Madagascar Amber', 'Vanilla']
    },
    gender: { ar: 'للجنسين', en: 'Unisex' }
  },
  'invictus': {
    name: { ar: 'انفيكتوس', en: 'Invictus' },
    tagline: { ar: 'عطر النصر والانتعاش الحركي', en: 'The Scent of Victory & Vitality' },
    description: {
      ar: 'التوازن المثالي بين الانتعاش البحري اللاذع ودفء خشب الغاياك، عطر النصر والشغف لأصحاب الطموح العالي.',
      en: 'The quintessential balance between oceanic freshness and guaiac wood warmth, honoring triumph and ambition.'
    },
    top_notes: {
      ar: ['نفحات بحرية', 'جريب فروت', 'يوسفي'],
      en: ['Marine Breeze', 'Grapefruit', 'Mandarin']
    },
    heart_notes: {
      ar: ['ورق الغار', 'ياسمين مائي'],
      en: ['Bay Laurel', 'Aquatic Jasmine']
    },
    base_notes: {
      ar: ['خشب الغاياك', 'طحلب السنديان', 'باتشولي'],
      en: ['Guaiac Wood', 'Oakmoss', 'Patchouli']
    },
    gender: { ar: 'رجالي', en: 'Men' }
  },
  'khamrah-qahwa': {
    name: { ar: 'خمرة قهوه', en: 'Khamrah Qahwa' },
    tagline: { ar: 'قهوة عربية مدخنة وعنبر معتق', en: 'Smoked Arabic Coffee & Aged Amber' },
    description: {
      ar: 'إبداع شرقي فاخر يفوح بعبق القهوة العربية الأصيلة مع الهيل والبرالين، مع قاعدة غنية من التونكا والعود المدخن.',
      en: 'An opulent oriental masterpiece opening with authentic Arabic coffee, cardamom, and praline over smoked oud and tonka.'
    },
    top_notes: {
      ar: ['قهوة عربية محمصة', 'هيل', 'زنجبيل'],
      en: ['Roasted Arabic Coffee', 'Cardamom', 'Ginger']
    },
    heart_notes: {
      ar: ['حلوى البرالين', 'قرفة سيلانية', 'زهور بيضاء'],
      en: ['Praline', 'Ceylon Cinnamon', 'White Blooms']
    },
    base_notes: {
      ar: ['قهوة مدخنة', 'تونكا معتقة', 'عنبر ملكي', 'بنزوين'],
      en: ['Smoked Coffee', 'Aged Tonka', 'Royal Amber', 'Benzoin']
    },
    gender: { ar: 'للجنسين', en: 'Unisex' }
  },
  'coming-soon-secret': {
    name: { ar: 'قريباً', en: 'Coming Soon' },
    tagline: { ar: 'إصدار ملكي سري', en: 'Secret Royal Edition' },
    description: {
      ar: 'إصدار استثنائي محفوظ في أقبية صقر قيد التعتيق النهائي، سيتم الكشف عنه لعملاء النخبة قريباً.',
      en: 'An exceptional secret formulation aging in private barrels. Unveiling soon for select connoisseurs.'
    },
    top_notes: { ar: ['سري'], en: ['Classified'] },
    heart_notes: { ar: ['سري'], en: ['Classified'] },
    base_notes: { ar: ['سري'], en: ['Classified'] },
    gender: { ar: 'إصدار خاص', en: 'Special Edition' }
  }
};

// UI Strings Dictionary
export const UI_STRINGS = {
  ar: {
    // Nav
    brandName: 'صَقْر',
    brandSub: 'دار العطور المصرية',
    home: 'الرئيسية',
    shop: 'المتجر',
    bestsellers: 'الأكثر طلباً',
    heritage: 'الأصالة',
    trackOrder: 'متابعة الطلب',
    cart: 'السلة',
    toggleLang: 'English',
    toggleThemeLight: 'نهاري',
    toggleThemeDark: 'ليلي',

    // Hero
    brandOriginPill: 'دار العطور المصرية الفاخرة',
    heroTitle1: 'فَخَـامَةٌ تَفْرِضُ',
    heroTitle2: 'حُـضُـورَهَا',
    heroDesc: 'زيوت عطرية نقية معتقة تجسد هيبة الصقر ونفحات الشرق. خالية من أي شوائب، مصممة لأصحاب الذوق الرفيع.',
    exploreShop: 'استكشف المتجر',
    bestsellersBtn: 'الأكثر طلباً',
    pillarLongevity: '+24 ساعة',
    pillarLongevitySub: 'ثبات مستمر',
    pillarPurity: '100%',
    pillarPuritySub: 'زيوت مركزة',
    pillarCod: 'دفع عند الاستلام',
    pillarCodSub: 'معاينة قبل الدفع',

    // Bestseller Slider
    bestsellerTag: 'الأعلى مبيعاً',
    bestsellerTitle: 'توليفات لا تتكرر',
    bestsellerDesc: 'العطور الأكثر طلباً وإعجاباً من عملاء صقر',
    volume50: '50 مل',
    volume100: '100 مل',
    currency: 'ج.م',
    orderPerfume: 'طلب العطر',
    viewDetails: 'تفاصيل العطر',
    comingSoonPill: 'ترقّب الإطلاق قريباً',
    comingSoonSecret: 'إصدار سري معتق',

    // Product Grid & Shop
    shopTag: 'دار صقر للعطور',
    shopTitle: 'عطور صَقْر',
    shopDesc: 'تصفح التوليفات الفاخرة (50 مل بـ 350 ج.م • 100 مل بـ 650 ج.م). شحن سريع 55 ج.م موحد لكافة المحافظات ومعاينة قبل الدفع.',
    searchPlaceholder: 'ابحث عن اسم العطر أو النوتات (مثال: فانيليا، قهوة، عود)...',
    categoryAll: 'الكل',
    categoryMen: 'رجالي',
    categoryUnisex: 'للجنسين',
    categorySpecial: 'إصدار خاص',
    noResults: 'لم نجد أي عطور تطابق بحثك حالياً.',
    resetFilter: 'عرض كافة العطور',
    viewAllPerfumes: 'تصفح كافة العطور في المتجر',

    // Product Detail
    backToShop: 'العودة للتشكيلة',
    houseOfSaqr: 'دار صقر للعطور المصرية الفاخرة',
    bottleSizePrice: 'اختر الحجم والسعر:',
    size50Label: 'حجم 50 مل',
    size50Sub: 'مناسب للتجربة والاستخدام اليومي',
    size100Label: 'حجم 100 مل (الأوفر)',
    size100Sub: 'الحجم الملكي الأصلي',
    freeShippingNotice: 'للزجاجة سعة {size} مل (معاينة وتجربة قبل الدفع)',
    addToCartBtn: 'اقتنِه الآن — إضافة للسلة ({total} ج.م)',
    whatsappConsult: 'تحدث مع خبير العطور عبر واتساب',
    whatsappMessagePrefix: 'مرحباً صقر، أود الاستفسار عن عطر',
    scentPyramid: 'الهرم العطري والتكوين النقي',
    topNotesTitle: 'قمة العطر (الافتتاحية)',
    heartNotesTitle: 'قلب العطر (الأثر)',
    baseNotesTitle: 'قاعدة العطر (الثبات)',
    badge24h: 'ثبات 24 ساعة',
    badge24hSub: 'زيوت معتقة',
    badgeInspect: 'معاينة قبل الدفع',
    badgeInspectSub: 'عند الاستلام',
    badgeFreeShip: 'شحن موحد',
    badgeFreeShipSub: '55 ج.م لكل المحافظات',
    relatedPerfumesTitle: 'عطور أخرى قد تروق لذوقك',
    mysteryComingSoonTitle: 'قريباً',
    mysteryComingSoonText: 'إصدار صقر السري قيد التعتيق الملكي، سيتم كشف الستار عنه قريباً.',
    bookingOpensSoon: 'سيتم فتح الحجز قريباً',

    // Cart Drawer
    cartHeader: 'السلة',
    emptyCartTitle: 'سلتك فارغة',
    emptyCartText: 'اختر عطورك المفضلة من تشكيلة صقر لتظهر هنا مباشرة.',
    exploreShopBtn: 'استكشف المتجر الآن',
    selectedItemsInCart: 'العطور المختارة في السلة:',
    shippingAndDelivery: 'الشحن والتوصيل',
    freeAcrossEgypt: '55 ج.م لكافة المحافظات',
    totalPriceLabel: 'المبلغ الإجمالي',
    proceedToCheckout: 'متابعة إتمام الطلب',
    inspectBeforePayCart: 'الدفع عند الاستلام بعد معاينة العطر',
    customerCare: 'خدمة العملاء',

    // Checkout
    checkoutTag: 'إتمام الطلب السريع',
    checkoutHeading: 'بيانات التوصيل والشحن',
    checkoutSubheading: 'الدفع عند الاستلام بعد فحص ومعاينة العطور. شحن سريع 55 ج.م ثابت لكافة محافظات مصر.',
    recipientSection: 'عنوان وتفاصيل المستلم',
    fullNameLabel: 'الاسم بالكامل',
    fullNamePlaceholder: 'مثال: أحمد عبد الله',
    phoneLabel: 'رقم الهاتف (للتواصل وتأكيد الشحن)',
    phonePlaceholder: '01xxxxxxxxx',
    governorateLabel: 'المحافظة',
    addressLabel: 'العنوان بالتفصيل (المنطقة، الشارع، رقم العمارة/الشقة)',
    addressPlaceholder: 'اكتب العنوان بدقة لتسريع وصول مندوب الشحن...',
    notesLabel: 'ملاحظات للمندوب (اختياري)',
    notesPlaceholder: 'مثال: الاتصال قبل الوصول بساعة أو تسليم في وقت محدد',
    paymentMethodTitle: 'طريقة الدفع: الدفع عند الاستلام',
    paymentMethodDesc: 'لك كامل الحق في معاينة وتجربة العطر قبل الدفع',
    confirmOrderSubmit: 'تأكيد الطلب الآن ({total} ج.م)',
    confirmOrderNotice: 'بالضغط على تأكيد، سيصلك إشعار فوري برقم وتفاصيل الشحنة',
    submittingOrder: 'جارِ تأكيد وتسجيل الطلب...',
    cartSummaryTitle: 'ملخص السلة',
    itemsCount: 'قطع',
    subtotalLabel: 'المجموع الفرعي',
    freeDeliveryBadge: 'مجاناً بالكامل',
    totalDueLabel: 'الإجمالي المستحق',
    promiseFastDelivery: 'شحن سريع خلال 24-48 ساعة لجميع المحافظات',
    promiseInspect: 'معاينة وتجربة العطر شخصياً قبل الدفع',
    promiseLongevity: 'ثبات عطري نقي يدوم لأكثر من 24 ساعة',

    // Order Success
    orderSuccessTitle: 'تم تأكيد طلبك بنجاح',
    orderSuccessSubtitle: 'شكراً لاختيارك دار صقر. تم تسجيل طلبك وسيتواصل معك فريق خدمة العملاء لتأكيد تفاصيل الشحن.',
    orderRefLabel: 'رقم الطلب الخاص بك:',
    amountDueAtDelivery: 'المبلغ المطلوب عند الاستلام:',
    trackingTokenTitle: 'رمز المتابعة الفوري:',
    copyBtn: 'نسخ',
    copiedBtn: 'تم النسخ',
    trackOrderAction: 'متابعة حالة الطلب والشحن',
    whatsappConfirmAction: 'تأكيد مباشر عبر واتساب',
    backToShoppingAction: 'العودة للتسوق',

    // Track Order
    trackTag: 'خدمة عملاء صقر',
    trackHeading: 'متابعة حالة الطلب والشحن',
    trackSubheading: 'أدخل رقم الطلب (مثال: SQR-1234) أو رمز التوكن للاطلاع على مسار الشحنة لحظياً من الداتابيز مباشرة.',
    trackInputPlaceholder: 'اكتب رقم الطلب أو التوكن هنا...',
    trackSearchBtn: 'استعلام فوري',
    trackNotFound: 'لم نجد طلباً بهذا الرقم. يرجى التأكد من الرمز المدخل.',
    trackDetailsTitle: 'تفاصيل الشحنة',
    customerNameLabel: 'العميل:',
    phoneLabelShort: 'الهاتف:',
    destinationLabel: 'المحافظة:',
    addressLabelShort: 'العنوان:',
    orderedItemsTitle: 'الأصناف المطلوبة:',
    timelineOrderPlaced: 'تم تسجيل الطلب',
    timelineConfirmed: 'تم تأكيد الطلب',
    timelineProcessing: 'جاري التجهيز والتعبئة',
    timelineShipped: 'خرج مع مندوب الشحن',
    timelineDelivered: 'تم التسليم بنجاح',
    timelineCancelled: 'تم إلغاء الطلب',
    whatsappInquiry: 'استفسار عبر واتساب بخصوص هذا الطلب',

    // Footer
    footerBrandDesc: 'علامة تجارية مصرية خالصة متخصصة في ابتكار أرقى الزيوت العطرية المعتقة بثبات استثنائي وتصميم فخم يعكس الهوية والأصالة.',
    quickLinksTitle: 'روابط سريعة',
    contactTitle: 'تواصل معنا',
    allRightsReserved: 'جميع الحقوق محفوظة لدار صقر للعطور',
    madeInEgypt: 'صُنع بكل فخر في مصر'
  },
  en: {
    // Nav
    brandName: 'SAQR',
    brandSub: 'Egyptian Perfumery',
    home: 'Home',
    shop: 'Shop',
    bestsellers: 'Bestsellers',
    heritage: 'Heritage',
    trackOrder: 'Track Order',
    cart: 'Bag',
    toggleLang: 'العربية',
    toggleThemeLight: 'Light',
    toggleThemeDark: 'Dark',

    // Hero
    brandOriginPill: 'The House of Egyptian Luxury Perfumes',
    heroTitle1: 'LUXURY IMPOSES',
    heroTitle2: 'ITS PRESENCE',
    heroDesc: 'Pure matured perfume oils embodying the falcon’s majesty and oriental richness. Flawless extracts tailored for discerning tastes.',
    exploreShop: 'Explore Shop',
    bestsellersBtn: 'Bestsellers',
    pillarLongevity: '+24 Hours',
    pillarLongevitySub: 'Lasting Projection',
    pillarPurity: '100%',
    pillarPuritySub: 'Concentrated Oils',
    pillarCod: 'Cash on Delivery',
    pillarCodSub: 'Inspect Before Paying',

    // Bestseller Slider
    bestsellerTag: 'BESTSELLERS',
    bestsellerTitle: 'Iconic Formulations',
    bestsellerDesc: 'The most demanded and celebrated fragrances by SAQR connoisseurs',
    volume50: '50 ml',
    volume100: '100 ml',
    currency: 'EGP',
    orderPerfume: 'Order Fragrance',
    viewDetails: 'Fragrance Details',
    comingSoonPill: 'Unveiling Soon',
    comingSoonSecret: 'Secret Matured Edition',

    // Product Grid & Shop
    shopTag: 'The House of SAQR',
    shopTitle: 'SAQR Parfums',
    shopDesc: 'Explore bespoke extraits (50 ml: 350 EGP • 100 ml: 650 EGP). Fixed 55 EGP shipping across Egypt with trial inspection upon delivery.',
    searchPlaceholder: 'Search fragrance or notes (e.g. Vanilla, Coffee, Amber)...',
    categoryAll: 'All',
    categoryMen: 'Men',
    categoryUnisex: 'Unisex',
    categorySpecial: 'Special Edition',
    noResults: 'No fragrances currently match your query.',
    resetFilter: 'Show All Fragrances',
    viewAllPerfumes: 'Explore Complete Collection in Shop',

    // Product Detail
    backToShop: 'Back to Collection',
    houseOfSaqr: 'The House of SAQR Egyptian Luxury Perfumes',
    bottleSizePrice: 'Select Volume & Price:',
    size50Label: '50 ml Size',
    size50Sub: 'Ideal for discovery and daily refinement',
    size100Label: '100 ml Size (Best Value)',
    size100Sub: 'Signature royal volume',
    freeShippingNotice: 'For {size} ml bottle (Inspect & test upon delivery)',
    addToCartBtn: 'Acquire Now — Add to Bag ({total} EGP)',
    whatsappConsult: 'Consult Fragrance Expert on WhatsApp',
    whatsappMessagePrefix: 'Hello SAQR, I would like to inquire about',
    scentPyramid: 'Olfactory Pyramid & Composition',
    topNotesTitle: 'Top Notes (Opening)',
    heartNotesTitle: 'Heart Notes (Sillage)',
    baseNotesTitle: 'Base Notes (Longevity)',
    badge24h: '24h Longevity',
    badge24hSub: 'Matured Oils',
    badgeInspect: 'Inspect Before Payment',
    badgeInspectSub: 'At Delivery',
    badgeFreeShip: 'Fixed Shipping',
    badgeFreeShipSub: '55 EGP Nationwide',
    relatedPerfumesTitle: 'Other Fragrances You May Admire',
    mysteryComingSoonTitle: 'Coming Soon',
    mysteryComingSoonText: 'SAQR secret edition aging in royal barrels. Unveiling soon for elite patrons.',
    bookingOpensSoon: 'Reservations Opening Soon',

    // Cart Drawer
    cartHeader: 'Bag',
    emptyCartTitle: 'Your Bag is Empty',
    emptyCartText: 'Select your signature fragrances from SAQR to view them here.',
    exploreShopBtn: 'Explore Shop Now',
    selectedItemsInCart: 'Selected Fragrances in Bag:',
    shippingAndDelivery: 'Shipping & Delivery',
    freeAcrossEgypt: '55 EGP Nationwide',
    totalPriceLabel: 'Total Amount',
    proceedToCheckout: 'Proceed to Checkout',
    inspectBeforePayCart: 'Cash on delivery after bottle inspection',
    customerCare: 'Customer Care',

    // Checkout
    checkoutTag: 'Express Checkout',
    checkoutHeading: 'Delivery & Shipping Details',
    checkoutSubheading: 'Cash on delivery after inspecting and testing your perfumes. Fixed 55 EGP shipping nationwide.',
    recipientSection: 'Recipient Information',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g. Ahmed Abdallah',
    phoneLabel: 'Phone Number (For dispatch confirmation)',
    phonePlaceholder: '01xxxxxxxxx',
    governorateLabel: 'Governorate',
    addressLabel: 'Detailed Address (Area, Street, Building/Apt)',
    addressPlaceholder: 'Enter complete address for smooth courier arrival...',
    notesLabel: 'Delivery Notes (Optional)',
    notesPlaceholder: 'e.g. Call one hour before arrival or specific delivery window',
    paymentMethodTitle: 'Payment Method: Cash on Delivery',
    paymentMethodDesc: 'You have full right to open and test the perfume prior to payment',
    confirmOrderSubmit: 'Confirm Order Now ({total} EGP)',
    confirmOrderNotice: 'By confirming, you will receive an instant shipment tracking code',
    submittingOrder: 'Confirming and recording your order...',
    cartSummaryTitle: 'Bag Summary',
    itemsCount: 'items',
    subtotalLabel: 'Subtotal',
    freeDeliveryBadge: 'Complimentary',
    totalDueLabel: 'Total Due',
    promiseFastDelivery: 'Express 24-48h delivery to all governorates',
    promiseInspect: 'Inspect and test your perfume before paying',
    promiseLongevity: 'Pure projection exceeding 24 hours',

    // Order Success
    orderSuccessTitle: 'Order Confirmed Successfully',
    orderSuccessSubtitle: 'Thank you for choosing The House of SAQR. Your order is registered and our concierge will reach out to coordinate delivery.',
    orderRefLabel: 'Your Order Reference:',
    amountDueAtDelivery: 'Amount Due at Delivery:',
    trackingTokenTitle: 'Instant Tracking Token:',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
    trackOrderAction: 'Track Order & Shipment',
    whatsappConfirmAction: 'Direct WhatsApp Confirmation',
    backToShoppingAction: 'Back to Shopping',

    // Track Order
    trackTag: 'SAQR Concierge',
    trackHeading: 'Track Your Order & Shipment',
    trackSubheading: 'Enter your order reference (e.g. SQR-1234) or tracking token to inspect live database records.',
    trackInputPlaceholder: 'Enter order code or token here...',
    trackSearchBtn: 'Track Now',
    trackNotFound: 'No order found matching this reference. Please verify your code.',
    trackDetailsTitle: 'Shipment Details',
    customerNameLabel: 'Client:',
    phoneLabelShort: 'Phone:',
    destinationLabel: 'Governorate:',
    addressLabelShort: 'Address:',
    orderedItemsTitle: 'Ordered Items:',
    timelineOrderPlaced: 'Order Placed',
    timelineConfirmed: 'Order Confirmed',
    timelineProcessing: 'Bottling & Packaging',
    timelineShipped: 'Out for Delivery',
    timelineDelivered: 'Delivered Successfully',
    timelineCancelled: 'Order Cancelled',
    whatsappInquiry: 'WhatsApp Inquiry regarding this order',

    // Footer
    footerBrandDesc: 'An authentic Egyptian luxury perfume house crafting matured fragrance extracts with extraordinary longevity and timeless design.',
    quickLinksTitle: 'Quick Links',
    contactTitle: 'Contact Us',
    allRightsReserved: 'All rights reserved to The House of SAQR Parfums',
    madeInEgypt: 'Proudly Crafted in Egypt'
  }
};

export function AppSettingsProvider({ children }) {
  // Theme state: Forced to 'dark' per user request (Light mode disabled & commented out)
  const [theme, setTheme] = useState('dark');

  // Language state: 'ar' | 'en'
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('saqr_lang') || 'ar';
    } catch {
      return 'ar';
    }
  });

  // Apply dark theme exclusively to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    try {
      localStorage.setItem('saqr_theme', 'dark');
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Apply language and direction to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('saqr_lang', lang);
    } catch (e) {
      console.error(e);
    }
  }, [lang]);

  // Theme toggle disabled
  const toggleTheme = () => {
    // Light mode is currently disabled
    setTheme('dark');
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // Translation helper
  const t = (key) => {
    const dict = UI_STRINGS[lang] || UI_STRINGS.ar;
    return dict[key] || UI_STRINGS.ar[key] || key;
  };

  // Helper to translate perfume objects
  const getLocalizedPerfume = (perfume) => {
    if (!perfume) return perfume;
    if (lang === 'ar') return perfume;

    // Lookup translation by slug or name
    const slugKey = perfume.slug || (
      perfume.name?.includes('لاتيه') ? 'bianco-latte' :
      perfume.name?.includes('اليكسير') ? 'invictus-elixir' :
      perfume.name?.includes('ايربا') ? 'erba-pura' :
      perfume.name?.includes('قهوه') || perfume.name?.includes('قهوة') ? 'khamrah-qahwa' :
      perfume.name?.includes('قريبا') || perfume.name?.includes('قريباً') ? 'coming-soon-secret' :
      perfume.name?.includes('انفيكتوس') ? 'invictus' : ''
    );

    const trans = PERFUME_TRANSLATIONS[slugKey];
    if (!trans) return perfume;

    return {
      ...perfume,
      name: trans.name?.en || perfume.name,
      tagline: trans.tagline?.en || perfume.tagline,
      description: trans.description?.en || perfume.description,
      top_notes: trans.top_notes?.en || perfume.top_notes,
      heart_notes: trans.heart_notes?.en || perfume.heart_notes,
      base_notes: trans.base_notes?.en || perfume.base_notes,
      gender: trans.gender?.en || perfume.gender
    };
  };

  return (
    <AppSettingsContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        lang,
        toggleLang,
        setLang,
        t,
        getLocalizedPerfume,
        governorates: GOVERNORATES[lang] || GOVERNORATES.ar
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};
