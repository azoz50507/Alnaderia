"""Build both ready-to-host homepages. Python standard library only."""
from pathlib import Path
from html import escape
from urllib.parse import quote
import json
import hashlib

ROOT = Path(__file__).resolve().parent.parent
ICONS = {
 'arrow':'<path d="M19 12H5m6-6-6 6 6 6"/>',
 'leaf':'<path d="M20 3c-8-1-16 3-16 10a7 7 0 0 0 12 5c4-4 4-10 4-15Z"/><path d="M4 21 15 10"/>',
 'bag':'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
 'hand':'<path d="m2 15 4-3 5 1a2 2 0 0 1 0 4H8m5-1 5-4a2 2 0 0 1 3 3l-7 6H7l-5-3"/><path d="M12 9V3m-3 3 3 3 3-3"/>',
 'gift':'<path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13"/><path d="M12 8C4 9 5 1 9 3c2 1 3 5 3 5Zm0 0c8 1 7-7 3-5-2 1-3 5-3 5Z"/>',
 'pin':'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 'chat':'<path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.9A9 9 0 1 1 21 11.5Z"/><path d="M8 8c1 4 2 5 6 7l2-2-3-1-1 1-2-2 1-1-1-3-2 1Z"/>',
 'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
 'check':'<path d="m5 12 4 4L19 6"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'sprout':'<path d="M12 22V12M12 15C2 15 2 8 2 6c7 0 10 3 10 9ZM12 12c0-7 4-10 10-10 0 7-4 10-10 10Z"/>',
}
def icon(name, cls=''):
 return f'<svg class="icon {cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'

def build(en=False):
 def t(ar,eng): return eng if en else ar
 def version(filename): return hashlib.sha256((ROOT/'assets'/filename).read_bytes()).hexdigest()[:10]
 base='../' if en else ''
 lang='en' if en else 'ar'
 direction='ltr' if en else 'rtl'
 name=t('مزرعة ومشاتل النادرية','Naderia Farm & Nurseries')
 title=t('النادرية | من خيرات عسير، إلى بيتك','Naderia | The goodness of Asir, brought home')
 desc=t('اكتشف تين النادرية الطازج والقطين وعجينة التين والشتلات من أحد رفيدة في عسير. اختر منتجاتك ونسّق طلبك مباشرة مع المزرعة عبر واتساب.','Discover fresh figs, dried figs, fig paste and nursery plants from Naderia in Ahad Rafidah, Asir. Build your selection and arrange your order with the farm on WhatsApp.')
 wa='https://wa.me/966503184880?text='+quote(t('السلام عليكم، أرغب بالاستفسار عن منتجات مزرعة النادرية.','Hello! I would like to ask about Naderia Farm products.'))
 visit='https://wa.me/966503184880?text='+quote(t('السلام عليكم، أرغب بتنسيق زيارة لمزرعة النادرية. ما المواعيد المتاحة وموقع المزرعة؟','Hello! I would like to arrange a visit to Naderia Farm. Please share available times and the farm location.'))
 nav_items=[('home',t('الرئيسية','Home')),('products',t('خيرات النادرية','Our harvest')),('story',t('حكايتنا','Our story')),('nursery',t('المشتل','The nursery')),('contact',t('تواصل معنا','Visit & connect'))]
 nav=''.join(f'<a href="#{id}">{label}</a>' for id,label in nav_items)
 products=[
 ('fresh','fruit','fig-harvest.webp',t('التين الطازج','Fresh figs'),t('من الغصن، في وقته الجميل. ثمار تُقطف وتُفرز يدويًا بعناية.','From the branch, at just the right moment. Carefully picked and sorted by hand.'),t('خيرات الموسم','Seasonal harvest'),'01'),
 ('dried','pantry','fig-pantry.webp',t('القطين الطبيعي','Naturally dried figs'),t('حلاوة التين في صورتها الأصيلة. رفيق القهوة ولحظات الضيافة.','The familiar sweetness of figs, naturally preserved. Made for coffee and company.'),t('من المونة','From the pantry'),'02'),
 ('paste','pantry','fig-pantry.webp',t('عجينة التين','Fig paste'),t('نكهة غنية تمنح فطورك ووصفاتك وحلوياتك لمسة مختلفة.','A rich fig flavour for slow breakfasts, favourite recipes and homemade desserts.'),t('لمسة لذيذة','A little indulgence'),'03'),
 ('seedling','plants','fig-nursery.webp',t('شتلات التين','Fig saplings'),t('ابدأ حكايتك مع الزراعة. شتلات نساعدك على اختيار الأنسب منها.','Start a growing story of your own. We will help you choose a suitable sapling.'),t('ازرع حكايتك','Grow your own'),'04'),
 ('cuttings','plants','fig-nursery.webp',t('عُقل التين','Fig cuttings'),t('خطوة صغيرة نحو شجرتك القادمة. تُنسَّق حسب موسم التقليم.','A small beginning for your next tree. Availability follows the pruning season.'),t('حسب الموسم','Seasonal selection'),'05'),
 ('gift','pantry','fig-harvest.webp',t('هدية بطعم الجنوب','A taste of Asir to give'),t('اختر من خيراتنا، واستفسر عن تنسيق تغليف يليق بمن تحب.','Choose a little of our harvest and ask us about thoughtful gift packaging.'),t('تنسيق هدايا','Gift enquiry'),'06'),
 ]
 cards=''
 for id,cat,img,pname,description,tag,num in products:
  cards+=f'''<article class="product-card reveal product-{id}" data-product-category="{cat}">
    <div class="product-visual"><img src="{base}assets/{img}" alt="{t('صورة تعبيرية: ','Illustrative image: ')}{pname}" width="720" height="560" loading="lazy" decoding="async"><span class="product-tag">{tag}</span><button class="product-peek" data-details="{id}" aria-label="{t('تفاصيل ','Details: ')}{pname}">{icon('plus')}</button></div>
    <div class="product-copy"><div class="product-title"><h3>{pname}</h3><span>{num}</span></div><p>{description}</p><div class="product-bottom"><span>{t('السعر والتوفر عند الطلب','Ask for price & availability')}</span><button class="product-add" data-order="{id}" aria-label="{t('أضف ','Add ')}{pname}{t(' إلى طلبك',' to your selection')}">{icon('plus')}</button></div></div>
  </article>'''
 filters=''.join(f'<button type="button" class="filter-btn{" active" if id=="all" else ""}" data-filter="{id}" aria-pressed="{"true" if id=="all" else "false"}">{label}</button>' for id,label in [('all',t('كل الخيرات','All the goodness')),('fruit',t('ثمار طازجة','Fresh harvest')),('pantry',t('مونة وهدايا','Pantry & gifts')),('plants',t('شتلات وعُقل','Plants & cuttings'))])
 faqs=[
 (t('كيف أطلب من النادرية؟','How do I place an order?'),t('أضف المنتجات التي تعجبك إلى قائمة طلبك، ثم راجع الكميات وأكمل عبر واتساب. نؤكد معك التوفر والسعر والوزن أو حجم الشتلة وطريقة الاستلام قبل تأكيد الطلب.','Add your favourite products to your selection, review the quantities, then continue on WhatsApp. We will confirm availability, price, weight or plant size, and delivery details before confirming your order.')),
 (t('هل التين الطازج متوفر طوال العام؟','Are fresh figs available all year?'),t('التين الطازج منتج موسمي، ويتغير توفره بحسب القطف والنضج. راسلنا لمعرفة المتاح حاليًا، ويمكنك أيضًا الاستفسار عن القطين وعجينة التين.','Fresh figs are seasonal, and availability depends on ripeness and harvesting. Message us to find out what is currently available, or ask about dried figs and fig paste.')),
 (t('هل يتوفر توصيل إلى منطقتي؟','Can you deliver to my area?'),t('ننسق التوصيل والشحن حسب موقعك ونوع المنتج والكمية. اذكر مدينتك في قائمة الطلب لنوضح لك الخيارات والتكلفة قبل التأكيد.','Delivery and shipping are arranged according to your location, product and quantity. Include your city in the selection so we can confirm the options and cost.')),
 (t('هل يمكن زيارة المزرعة؟','Can I visit the farm?'),t('يا مرحبًا بك. الزيارة بالتنسيق المسبق؛ تواصل معنا لنتفق على الموعد ونشاركك الموقع الدقيق للمزرعة.','You are very welcome. Visits are by prior arrangement; contact us to agree on a time and receive the exact farm location.')),
 (t('أرغب بالزراعة، أي شتلة أختار؟','Which plant should I choose?'),t('أخبرنا بمنطقتك ومكان الزراعة، سواء في الأرض أو في أصيص. نساعدك في اختيار الشتلة أو العُقلة المناسبة ونوضح لك تفاصيل العناية عند الطلب.','Tell us your region and whether you plan to grow in the ground or a pot. We will help you choose a suitable sapling or cutting and discuss its care when you order.')),
 (t('هل تقبلون طلبات الجملة والمناسبات؟','Do you take wholesale and occasion orders?'),t('نعم، يمكنك التواصل لتنسيق كميات المحلات والمناسبات والهدايا. أرسل الكمية التقريبية والتاريخ المطلوب، ونؤكد لك ما يمكن توفيره.','Yes. Contact us about shops, occasions and gift orders. Share an approximate quantity and date, and we will confirm what we can provide.')),
 ]
 faq_markup=''.join(f'<details class="faq-item"><summary>{q}{icon("plus")}</summary><p>{a}</p></details>' for q,a in faqs)
 schema={'@context':'https://schema.org','@type':'LocalBusiness','name':name,'alternateName':'Naderia Farm and Nurseries','url':'https://alnaderia.com/','logo':'https://alnaderia.com/assets/logo.png','telephone':'+966503184880','address':{'@type':'PostalAddress','addressCountry':'SA','addressRegion':'Asir','addressLocality':'Ahad Rafidah'},'founder':{'@type':'Person','name':'عبدالله عايض أبو درمان القحطاني'},'description':desc}
 faq_schema={'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in faqs]}
 brand=f'<span class="brand-emblem"><img src="{base}assets/logo.webp" alt="" width="884" height="735"></span><span class="brand-word"><b>{t("النادرية","Naderia")}</b><small>{t("مزرعة ومشاتل","FARM & NURSERIES")}</small></span>'
 trust=''.join(f'<div>{icon(i)}<span><b>{a}</b><small>{b}</small></span></div>' for i,a,b in [
 ('leaf',t('من خيرات الطبيعة','Nature’s own goodness'),t('مذاق بسيط وأصيل','Simple. Honest. Delicious.')),
 ('hand',t('قطف وفرز يدوي','Hand-picked with care'),t('العناية في كل ثمرة','Attention in every fruit')),
 ('gift',t('تغليف يليق بالهدية','Thoughtfully packaged'),t('تفاصيل تصنع الفرق','The little details matter')),
 ('pin',t('من مرتفعات عسير','From the Asir highlands'),t('أحد رفيدة · الفرعين','Ahad Rafidah · Al-Far’ayn')),
 ])
 steps=''.join(f'<article><span class="step-number">0{n}</span><h3>{a}</h3><p>{b}</p></article>' for n,a,b in [
 (1,t('اختر ما تحب','Find your favourites'),t('تصفّح الثمار والمونة والشتلات، واجمع اختياراتك في قائمة واحدة.','Explore our harvest, pantry and nursery, and gather your favourites in one place.')),
 (2,t('خلّنا نرتّبها لك','Let’s work out the details'),t('أرسل قائمتك عبر واتساب لنتفق على الكميات والأسعار والتوفر.','Share your selection on WhatsApp to confirm quantities, prices and availability.')),
 (3,t('خيراتنا في طريقها إليك','A little goodness, coming home'),t('ننسق الاستلام أو التوصيل حسب منطقتك، ونجهّز طلبك بعناية.','Arrange collection or delivery for your area, and we will prepare your order with care.')),
 ])
 return f'''<!DOCTYPE html>
<html lang="{lang}" dir="{direction}">
<head>
 <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
 <meta name="theme-color" content="#193e32"><title>{title}</title>
 <meta name="description" content="{escape(desc)}">
 <link rel="canonical" href="https://alnaderia.com/{'en/' if en else ''}">
 <link rel="alternate" hreflang="ar" href="https://alnaderia.com/"><link rel="alternate" hreflang="en" href="https://alnaderia.com/en/"><link rel="alternate" hreflang="x-default" href="https://alnaderia.com/">
 <link rel="icon" href="{base}favicon.svg" type="image/svg+xml">
 <meta property="og:type" content="website"><meta property="og:title" content="{title}"><meta property="og:description" content="{escape(desc)}"><meta property="og:url" content="https://alnaderia.com/{'en/' if en else ''}"><meta property="og:image" content="https://alnaderia.com/assets/og.png"><meta property="og:locale" content="{'en_US' if en else 'ar_SA'}"><meta name="twitter:card" content="summary_large_image">
 <link rel="preload" href="{base}assets/fonts/ibm-plex-sans-arabic-400-normal-arabic.woff2" as="font" type="font/woff2" crossorigin>
 <link rel="preload" href="{base}assets/fig-harvest.webp" as="image" fetchpriority="high">
 <link rel="stylesheet" href="{base}assets/fonts.css"><link rel="stylesheet" href="{base}assets/style.css?v={version('style.css')}"><link rel="stylesheet" href="{base}assets/experience.css?v={version('experience.css')}">
 <script src="{base}assets/experience.js?v={version('experience.js')}" defer></script>
 <script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script>
 <script type="application/ld+json">{json.dumps(faq_schema,ensure_ascii=False)}</script>
</head>
<body>
 <a class="skip-link" href="#main">{t('انتقل إلى المحتوى','Skip to content')}</a>
 <div class="announcement"><span>{icon('leaf')}{t('من أرضنا، بكل حب… إلى بيتك','From our land, with love… to your home')}</span><a href="{wa}" target="_blank" rel="noopener">{t('اسأل عن حصاد هذا الموسم','Ask about this season’s harvest')} <span aria-hidden="true">↗</span></a></div>
 <header class="site-header" id="siteHeader"><div class="container header-inner">
  <a class="brand" href="#home" aria-label="{name}">{brand}</a>
  <nav class="desktop-nav" aria-label="{t('التنقل الرئيسي','Main navigation')}">{nav}</nav>
  <div class="header-actions"><a class="lang-switch" href="{'../' if en else 'en/'}" lang="{'ar' if en else 'en'}">{t('EN','العربية')}</a><span class="header-divider"></span><button class="basket-button" data-order="" aria-label="{t('افتح قائمة طلبك','Open your selection')}">{icon('bag')}<span class="basket-label">{t('طلبك','Your selection')}</span><span class="cart-count" data-cart-count>0</span></button><button class="menu-button" id="menuBtn" aria-controls="mobileNav" aria-expanded="false" aria-label="{t('فتح القائمة','Open menu')}">{icon('menu')}</button></div>
 </div><nav class="mobile-nav" id="mobileNav" aria-label="{t('قائمة الجوال','Mobile navigation')}" hidden>{nav}</nav></header>
 <main id="main">
  <section class="hero container" id="home" aria-labelledby="heroTitle">
   <div class="hero-copy"><div class="eyebrow"><span></span>{t('أرضٌ طيبة. ثمارٌ نادرة.','GOOD LAND. RARE GOODNESS.')}</div>
    <h1 id="heroTitle">{t('من خيرات عسير،<br>إلى <em>قلب بيتك.</em>','Rooted in Asir.<br>Made for <em>your home.</em>')}</h1>
    <p class="hero-description">{t('لأن أجمل ما في الأرض، يستحق أن يصل إليك.<br>تينٌ نعتني به من الغصن، وخيراتٌ تحمل أصالة الجنوب<br class="desktop-break"> وكرم أهله… هذه حكاية النادرية.','The best things grow with care. From sun-ripened figs to a tree of your own, discover a little of the warmth, generosity and goodness of our southern home.')}</p>
    <div class="hero-actions"><a class="button button-primary" href="#products">{t('اكتشف خيراتنا','Explore our harvest')}{icon('arrow','direction-arrow')}</a><a class="text-link" href="#story">{t('تعرّف على حكايتنا','Meet Naderia')}<span class="round-arrow">↗</span></a></div>
    <div class="hero-origin">{icon('pin')}<span>{t('الفرعين، أحد رفيدة','Al-Far’ayn, Ahad Rafidah')}<small>{t('من قلب مرتفعات عسير، المملكة العربية السعودية','In the Asir highlands, Saudi Arabia')}</small></span><span class="origin-line"></span><span class="origin-note">{t('نزرع بحب<br>ونحصد بإتقان','Grown with love.<br>Picked with care.')}</span></div>
   </div>
   <div class="hero-art"><div class="hero-image-frame"><img class="hero-image" src="{base}assets/fig-harvest.webp" alt="{t('صورة تعبيرية لثمار تين ناضجة في وعاء فخاري بين أوراق التين','Illustrative photograph of ripe figs in a handmade bowl among fig leaves')}" width="1536" height="1024" fetchpriority="high"><div class="image-gradient"></div><span class="photo-label">{t('صورة تعبيرية','Illustrative image')}</span><div class="photo-caption"><span>FRESH FROM NATURE</span><p>{t('للخيرات… طعم آخر هنا.','Goodness grows here.')}</p></div></div>
    <div class="harvest-seal"><span>{t('من أرض عسير','FROM ASIR')}</span>{icon('sprout')}<span>{t('بكل حب وعناية','WITH LOVE & CARE')}</span></div>
    <div class="harvest-note">{icon('leaf')}<div><b>{t('على مهل الطبيعة','At nature’s pace')}</b><span>{t('ننتظر النضج… لتستحق كل قضمة.','Good things are worth waiting for.')}</span></div><span class="note-star">✳</span></div>
   </div>
  </section>
  <div class="trust-strip"><div class="container trust-grid">{trust}</div></div>
  <section class="products section container" id="products" aria-labelledby="productsTitle">
   <div class="section-heading"><div><div class="eyebrow">{t('ما تجود به أرضنا','THE GOOD THINGS WE GROW')}</div><h2 id="productsTitle">{t('خيرات تستحق <em>أن تُكتشف.</em>','A little goodness.<br><em>A lot to discover.</em>')}</h2></div><p>{t('للمائدة، للضيافة، ولركنٍ أخضر في بيتك.<br>اختر ما تحب، ودع الباقي علينا.','For your table, for someone special,<br>or for a greener corner of your home.')}</p></div>
   <div class="catalog-toolbar"><div class="product-filters" role="group" aria-label="{t('تصفية المنتجات','Filter products')}">{filters}</div><span id="productCount" class="product-count" role="status" aria-live="polite">{t('٦ اختيارات','6 selections')}</span></div>
   <div class="product-grid">{cards}</div>
   <p class="catalog-note">{icon('leaf')}{t('كل موسم له خيراته. نؤكد الأسعار والأحجام والتوفر معك قبل الطلب. الصور تعبيرية وليست تصويرًا للمنتجات الفعلية.','Every season brings something different. Prices, sizes and availability are confirmed before ordering. Images are illustrative, not photographs of the actual products.')}</p>
  </section>
  <section class="story section" id="story" aria-labelledby="storyTitle"><div class="container story-grid">
   <div class="story-art reveal"><img src="{base}assets/fig-nursery.webp" alt="{t('صورة تعبيرية لشجرة تين صغيرة وأوراقها الخضراء','Illustrative image of a young fig tree and its green leaves')}" width="1024" height="1536" loading="lazy"><span class="story-location">{icon('pin')} ASIR, SAUDI ARABIA</span><div class="story-card"><span>{t('حكاية تبدأ من','A STORY ROOTED IN')}</span><b>{t('الأرض.','the land.')}</b><i>{t('وتكبر بالعناية','and grown with care')}</i></div></div>
   <div class="story-copy reveal"><div class="eyebrow">{t('أهلًا بك في النادرية','WELCOME TO NADERIA')}</div><h2 id="storyTitle">{t('نحن من هذه الأرض،<br><em>وهذه الأرض منّا.</em>','This is our land.<br><em>This is our story.</em>')}</h2><p>{t('في الفرعين، بين مرتفعات أحد رفيدة، تنمو حكايتنا مع شجرة التين. نعتني بها من أول ورقة إلى آخر ثمرة، ونؤمن أن الجودة تبدأ من صبر المزارع وحبّه لأرضه.','In Al-Far’ayn, among the highlands of Ahad Rafidah, our story grows alongside the fig tree. From its first leaf to its last fruit, we believe good produce begins with patience and a love of the land.')}</p><p>{t('النادرية مزرعة ومشتل، ومساحة نشاركك فيها ما نحب: ثمارًا طيبة، وغرسًا ينمو معك، وتفاصيل تحمل روح الجنوب.','Naderia is a farm, a nursery, and a place to share the things we love: good fruit, plants that grow with you, and a little of the spirit of southern Saudi Arabia.')}</p><div class="story-values"><span>{icon('check')}{t('عناية من الجذور','Care from the roots')}</span><span>{icon('check')}{t('قطف وفرز يدوي','Hand-picked harvest')}</span><span>{icon('check')}{t('هوية جنوبية أصيلة','An authentic Asir story')}</span></div><a class="text-link" href="{visit}" target="_blank" rel="noopener">{t('حياك الله في أرضنا','You’re welcome on our land')}{icon('arrow','direction-arrow')}</a><div class="founder"><span class="founder-mark">{icon('sprout')}</span><div><b>{t('عبدالله عايض أبو درمان القحطاني','Abdullah Ayed Abu Darman Al-Qahtani')}</b><small>{t('أبو عبدالكريم · مؤسس النادرية','Abu Abdulkarim · Founder of Naderia')}</small></div></div></div>
  </div></section>
  <section class="nursery section container" id="nursery" aria-labelledby="nurseryTitle"><div class="nursery-panel"><div class="nursery-copy"><div class="eyebrow">{t('لكل غرسة، حكاية جديدة','EVERY TREE BEGINS A STORY')}</div><h2 id="nurseryTitle">{t('خذ من حكايتنا،<br><em>وازرع حكايتك.</em>','Take a little of our story.<br><em>Grow one of your own.</em>')}</h2><p>{t('أول شجرة في حديقتك؟ أو إضافة جديدة لمزرعتك؟<br>مع شتلات وعُقل النادرية، نساعدك تبدأ الخطوة الأولى.','Your first garden tree, or a new addition to your farm?<br>Our saplings and cuttings are a lovely place to start.')}</p><button class="button button-light" data-order="seedling">{t('ابدأ رحلتك مع الزراعة','Start your growing story')}{icon('sprout')}</button><span class="nursery-footnote">{t('أخبرنا بمنطقتك ومكان الزراعة، ونساعدك تختار.','Tell us where you’re planting. We’ll help you choose.')}</span></div><div class="nursery-picture"><img src="{base}assets/fig-nursery.webp" alt="{t('صورة تعبيرية لشتلة تين في أصيص فخاري','Illustrative photograph of a fig sapling in a terracotta pot')}" width="1024" height="1536" loading="lazy"><span class="nursery-label">{icon('sprout')}{t('من غرسة… إلى خير','Small beginnings. Good things.')}</span></div></div></section>
  <section class="how section container" id="how" aria-labelledby="howTitle"><div class="section-heading centered"><div class="eyebrow">{t('قريبون منك، من أول اختيار','PERSONAL, FROM THE VERY FIRST PICK')}</div><h2 id="howTitle">{t('طلبك… <em>على طريقتك.</em>','Your harvest. <em>Your way.</em>')}</h2><p>{t('تجربة بسيطة، وتواصل مباشر مع أهل المزرعة.','A simple experience, with the people who grow it.')}</p></div><div class="steps">{steps}</div><div class="how-action"><button class="button button-primary" data-order="">{t('جهّز قائمة طلبك','Build your selection')}{icon('bag')}</button><small>{t('بدون تسجيل · نؤكد التفاصيل معك قبل الشراء','No account needed · Details confirmed before purchase')}</small></div></section>
  <section class="faq section" id="faq" aria-labelledby="faqTitle"><div class="container faq-layout"><div class="faq-intro"><div class="eyebrow">{t('قبل أن تسأل','A FEW THINGS TO KNOW')}</div><h2 id="faqTitle">{t('كل ما يهمك،<br><em>بكل وضوح.</em>','Good questions.<br><em>Clear answers.</em>')}</h2><p>{t('باقي في بالك سؤال؟<br>نحن هنا، ويسعدنا الحديث معك.','Still have something on your mind?<br>We’re always happy to chat.')}</p><a class="text-link" href="{wa}" target="_blank" rel="noopener">{icon('chat')}{t('اسألنا على واتساب','Ask us on WhatsApp')}{icon('arrow','direction-arrow')}</a></div><div class="faq-list">{faq_markup}</div></div></section>
  <section class="contact section container" id="contact" aria-labelledby="contactTitle"><div class="contact-panel"><div class="contact-top"><div class="eyebrow">{t('يا مرحبًا، عدد ما أثمر الغصن','THERE’S ALWAYS A WARM WELCOME')}</div><span>{icon('pin')} {t('عسير · أحد رفيدة · الفرعين','ASIR · AHAD RAFIDAH · AL-FAR’AYN')}</span></div><h2 id="contactTitle">{t('الخير يجمعنا.<br><em>والتواصل يقرّبنا.</em>','Good things bring us together.<br><em>Let’s stay close.</em>')}</h2><div class="contact-bottom"><p>{t('لطلبك، لزيارتك، أو حتى لسؤال عن شجرة تين.<br>يسعدنا أن نكون جزءًا من يومك.','For your order, a visit, or a question about a fig tree.<br>We’d love to be a little part of your day.')}</p><div class="contact-actions"><a class="button button-light" href="{wa}" target="_blank" rel="noopener">{icon('chat')}{t('خلّنا نتواصل','Let’s talk')}</a><a class="contact-phone" href="tel:+966503184880" dir="ltr">050 318 4880 <span>↗</span></a></div></div><div class="qatt-line" aria-hidden="true"></div></div><div class="visit-note">{icon('pin')}<span>{t('تخطط لزيارة؟ يسعدنا استقبالك بالتنسيق المسبق.','Planning a visit? We look forward to welcoming you by prior arrangement.')}</span><a href="{visit}" target="_blank" rel="noopener">{t('نسّق زيارتك واطلب الموقع','Arrange a visit & get directions')} ↗</a></div></section>
 </main>
 <footer class="site-footer"><div class="container"><div class="footer-main"><div><a class="brand" href="#home" aria-label="{name}">{brand}</a><p>{t('أصالة الأرض، وجودة الثمر، وعبق الجنوب.','Good land. Good fruit. A little of the south.')}</p></div><div class="footer-links"><a href="#products">{t('خيراتنا','Our harvest')}</a><a href="#story">{t('حكايتنا','Our story')}</a><a href="#faq">{t('أسئلتك','Your questions')}</a><a href="privacy.html">{t('الخصوصية','Privacy')}</a></div><a class="back-top" href="#home" aria-label="{t('العودة إلى أعلى الصفحة','Back to top')}">↑</a></div><div class="footer-bottom"><span>© <span id="year">2026</span> {name}. {t('بكل حب، من عسير.','With love, from Asir.')}</span><span class="footer-signature">GROWN WITH LOVE <span>✳</span> NADERIA</span></div></div></footer>
 <a class="whatsapp-float" href="{wa}" target="_blank" rel="noopener" aria-label="{t('تواصل عبر واتساب','Chat on WhatsApp')}">{icon('chat')}<span>{t('نحن قريبون','Let’s talk')}</span></a>
 <noscript><div class="noscript-note">{t('يمكنك تصفح جميع المنتجات والتواصل مباشرة عبر واتساب. فعّل JavaScript لتصفية المنتجات وتجميع قائمة الطلب.','Browse every product and contact us directly on WhatsApp. Enable JavaScript to filter products and build a selection.')} <a href="{wa}">{t('تواصل معنا','Contact us')}</a></div><style>[data-order],[data-details],.product-filters,.menu-button{{display:none!important}}.desktop-nav{{display:flex!important;flex-wrap:wrap}}.header-inner{{flex-wrap:wrap}}</style></noscript>
</body></html>
'''

if __name__=='__main__':
 for en,path in [(False,ROOT/'index.html'),(True,ROOT/'en'/'index.html')]:
  path.write_text(build(en),encoding='utf-8')
  print(f'Built {path.relative_to(ROOT)}')
