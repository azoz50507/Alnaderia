/* Naderia — a small, private-by-default product inquiry experience. */
(function () {
  'use strict';

  function init() {
    var english = document.documentElement.lang.toLowerCase().indexOf('en') === 0;
    var locale = english ? 'en' : 'ar-SA';
    var number = new Intl.NumberFormat(locale);
    var storageKey = 'naderia.inquiry.v1';
    var maximumQuantity = 99;
    var storageAvailable = true;
    var toastTimer;
    var labels = english ? {
      close: 'Close', eyebrow: 'A little piece of Naderia', title: 'Your farm selection',
      intro: 'Bring your favourites together. We’ll confirm availability, pack sizes and prices with you on WhatsApp.',
      emptyTitle: 'Good things begin with a choice.', emptyText: 'Add fruit, a pantry favourite or the beginning of your own fig tree.',
      choose: 'Choose a product', add: 'Add to selection', remove: 'Remove', clear: 'Clear selection', cleared: 'Your selection has been cleared.', decrease: 'Decrease quantity of', increase: 'Increase quantity of',
      quantity: 'Requested quantity', packNote: 'Pack size and price confirmed with the farm',
      optional: 'Make it yours', optionalHint: 'These details are optional.', name: 'Your name', namePlaceholder: 'How should we address you?',
      city: 'City', cityPlaceholder: 'Your delivery or collection city', note: 'A note for the farm',
      notePlaceholder: 'Preferred weight, gift packaging, occasion or a question…',
      checkout: 'Continue on WhatsApp', checkoutHint: 'Review your message in WhatsApp and send it when you’re ready. This is an inquiry, not a confirmed order.',
      privacy: 'Only your product selection is saved on this device when storage is available. Your contact details are not saved.',
      sessionOnly: 'Your selection is available for this visit. Browser storage is unavailable.',
      browse: 'Explore the collection', added: 'Added to your selection', removed: 'Removed from your selection',
      details: 'A closer look', careTitle: 'Good to know', inquire: 'Add to my selection',
      availability: 'Ask us about today’s availability and pack options.',
      count: function (count) { return number.format(count) + (count === 1 ? ' product' : ' products'); },
      selectionCount: function (count) { return number.format(count) + (count === 1 ? ' requested item' : ' requested items'); },
      updated: 'Your selection has been updated.', max: 'You can request up to 99 units here. For larger quantities, add a note.',
      messageIntro: 'Hello Naderia Farm, I would like to inquire about the following:',
      messageEnd: 'Please confirm availability, pack sizes, prices and delivery or collection options. Thank you.',
      contactName: 'Name', contactCity: 'City', contactNote: 'Note', messageQuantity: 'requested quantity'
    } : {
      close: 'إغلاق', eyebrow: 'شيء من النادرية', title: 'اختياراتك من المزرعة',
      intro: 'اجمع ما تحب، ونتواصل معك عبر واتساب لتأكيد التوفر وأحجام العبوات والأسعار.',
      emptyTitle: 'الحكاية تبدأ باختيارك.', emptyText: 'أضف ثمرة تحبها، أو مذاقًا لمائدتك، أو البداية لشجرة تين في بيتك.',
      choose: 'اختر منتجًا', add: 'أضف لاختياراتي', remove: 'إزالة', clear: 'مسح الاختيارات', cleared: 'تم مسح اختياراتك.', decrease: 'تقليل كمية', increase: 'زيادة كمية',
      quantity: 'الكمية المطلوبة', packNote: 'حجم العبوة والسعر يُؤكدان مع المزرعة',
      optional: 'على ذوقك', optionalHint: 'هذه التفاصيل اختيارية.', name: 'اسمك', namePlaceholder: 'بأي اسم نناديك؟',
      city: 'المدينة', cityPlaceholder: 'مدينة التوصيل أو الاستلام', note: 'رسالة للمزرعة',
      notePlaceholder: 'الوزن الذي تفضله، تغليف هدية، مناسبة أو أي استفسار…',
      checkout: 'أكمل عبر واتساب', checkoutHint: 'راجع رسالتك في واتساب وأرسلها عندما تكون جاهزًا. هذه قائمة استفسار وليست طلبًا مؤكدًا.',
      privacy: 'تُحفظ اختيارات المنتجات على هذا الجهاز إذا أتاح المتصفح ذلك. لا نحفظ بيانات التواصل التي تكتبها.',
      sessionOnly: 'اختياراتك متاحة خلال هذه الزيارة. التخزين في المتصفح غير متاح.',
      browse: 'اكتشف المنتجات', added: 'أُضيف إلى اختياراتك', removed: 'أُزيل من اختياراتك',
      details: 'تعرّف عليه أكثر', careTitle: 'تفاصيل تهمك', inquire: 'أضف لاختياراتي',
      availability: 'اسألنا عن توفر اليوم وخيارات العبوات.',
      count: function (count) { return count === 1 ? 'منتج واحد' : count === 2 ? 'منتجان' : number.format(count) + ' منتجات'; },
      selectionCount: function (count) { return 'الكمية الإجمالية: ' + number.format(count); },
      updated: 'تم تحديث اختياراتك.', max: 'يمكن طلب حتى ٩٩ وحدة هنا. للكميات الأكبر، اكتب لنا في الملاحظات.',
      messageIntro: 'السلام عليكم مزرعة النادرية، أرغب بالاستفسار عن المنتجات التالية:',
      messageEnd: 'أرجو تأكيد التوفر وأحجام العبوات والأسعار وخيارات التوصيل أو الاستلام. شكرًا لكم.',
      contactName: 'الاسم', contactCity: 'المدينة', contactNote: 'ملاحظات', messageQuantity: 'الكمية المطلوبة'
    };
    var products = english ? {
      fresh: { name: 'Fresh figs', tag: 'The season’s fruit', mark: '01', description: 'Figs from Naderia, hand-picked in Ahad Rafidah. A simple pleasure for the table, or something thoughtful to share.', care: 'Fresh fruit follows the harvest. Ask about the available varieties, ripeness and collection timing. Confirm storage advice with the farm when ordering.' },
      dried: { name: 'Dried figs · Qateen', tag: 'A taste of the pantry', mark: '02', description: 'The familiar character of figs in their dried form. An Asiri pantry favourite to enjoy on its own or alongside coffee.', care: 'Ask about available pack sizes, ingredients and the storage instructions for your chosen pack.' },
      paste: { name: 'Fig paste', tag: 'Made for your table', mark: '03', description: 'A different way to enjoy the flavour of figs, for your own recipes, baking and favourite pairings.', care: 'Tell us how you plan to use it. The farm can confirm the ingredients, pack sizes and storage details before you order.' },
      seedling: { name: 'Fig saplings', tag: 'Let your story grow', mark: '04', description: 'Start your own connection with the fig tree. Explore the saplings available from Naderia’s nursery.', care: 'Share your city and planting space. Ask the nursery about the available variety, plant size and suitable planting and care instructions for your location.' },
      cuttings: { name: 'Fig cuttings', tag: 'For growers', mark: '05', description: 'Fig cuttings for those who enjoy the process of growing and propagation. Availability depends on the pruning season.', care: 'Confirm variety, preparation and timing with the nursery. Rooting and growth depend on conditions and care; ask for advice suited to your planting setup.' },
      gift: { name: 'A gift from Naderia', tag: 'Thoughtfully chosen', mark: '06', description: 'Turn your choice from the farm into a thoughtful gift. Tell us the occasion and the products you have in mind.', care: 'Gift contents, packaging, quantities and timing are arranged with the farm according to availability. Add your preferences to your inquiry.' }
    } : {
      fresh: { name: 'التين الطازج', tag: 'من ثمار الموسم', mark: '01', description: 'تين النادرية، يُقطف يدويًا في أحد رفيدة. متعة بسيطة على مائدتك، ولفتة جميلة لمن تحب.', care: 'الثمار الطازجة مرتبطة بالقطاف. اسألنا عن الأصناف المتاحة ودرجة النضج وموعد الاستلام، وتعليمات الحفظ المناسبة عند تأكيد طلبك.' },
      dried: { name: 'التين المجفف · القطين', tag: 'مذاق من المؤونة', mark: '02', description: 'للتين حكاية أخرى حين يصبح قطينًا. مذاق مألوف في المؤونة العسيرية، تستمتع به وحده أو بجوار فنجان قهوة.', care: 'اسألنا عن أحجام العبوات المتاحة ومكوناتها، واتبع تعليمات الحفظ الخاصة بالعبوة التي تختارها.' },
      paste: { name: 'عجينة التين', tag: 'لمائدتك ووصفاتك', mark: '03', description: 'طريقة أخرى للاستمتاع بمذاق التين، في وصفاتك ومخبوزاتك والإضافات التي تحبها.', care: 'أخبرنا كيف ترغب باستخدامها. نؤكد معك المكونات وحجم العبوة وتفاصيل الحفظ قبل الطلب.' },
      seedling: { name: 'شتلات التين', tag: 'ابدأ حكايتك مع الأرض', mark: '04', description: 'ازرع صلتك الخاصة بشجرة التين، واكتشف الشتلات المتاحة من مشاتل النادرية.', care: 'شاركنا مدينتك ومساحة الزراعة. اسأل المشتل عن الصنف وحجم الشتلة وطريقة الزراعة والعناية المناسبة لظروف منطقتك.' },
      cuttings: { name: 'عُقل التين', tag: 'لأهل الزراعة', mark: '05', description: 'عُقل تين لمن يحب رحلة الغرس والإكثار. يتحدد توفرها بحسب موسم التقليم.', care: 'تأكد من الصنف وتجهيز العُقل والوقت المناسب مع المشتل. نجاح التجذير والنمو يعتمد على ظروف الزراعة والعناية؛ اسأل عن الإرشادات المناسبة لك.' },
      gift: { name: 'هدية من النادرية', tag: 'اختيار يحمل معنى', mark: '06', description: 'اجعل اختيارك من المزرعة هدية لطيفة. أخبرنا بالمناسبة والمنتجات التي ترغب بإهدائها.', care: 'محتويات الهدية والتغليف والكميات والموعد تُنسّق مع المزرعة بحسب المتاح. أضف ما تفضله في ملاحظات الاستفسار.' }
    };

    function element(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    function button(className, text, label) {
      var node = element('button', className, text);
      node.type = 'button';
      if (label) node.setAttribute('aria-label', label);
      return node;
    }

    function validBasket(value) {
      var clean = Object.create(null);
      if (!value || typeof value !== 'object' || Array.isArray(value)) return clean;
      Object.keys(products).forEach(function (id) {
        if (!Object.prototype.hasOwnProperty.call(value, id)) return;
        var quantity = value[id];
        if (typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0) {
          clean[id] = Math.min(quantity, maximumQuantity);
        }
      });
      return clean;
    }

    function readBasket() {
      try { return validBasket(JSON.parse(window.localStorage.getItem(storageKey))); }
      catch (error) { storageAvailable = false; return Object.create(null); }
    }

    var basket = readBasket();
    var toast = element('div', 'exp-toast');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    function notify(message) {
      var activeDialog = document.querySelector('.exp-dialog[open]');
      var live = activeDialog ? activeDialog.querySelector('[data-dialog-status]') : toast;
      if (live) {
        live.textContent = message;
        if (live === toast) {
          window.clearTimeout(toastTimer);
          toast.classList.add('is-visible');
          toastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 3200);
        }
      }
    }

    function persistBasket() {
      try { window.localStorage.setItem(storageKey, JSON.stringify(basket)); storageAvailable = true; }
      catch (error) { storageAvailable = false; }
      if (privacyNote) privacyNote.textContent = storageAvailable ? labels.privacy : labels.sessionOnly;
    }

    function totalItems() {
      return Object.keys(basket).reduce(function (sum, id) { return sum + basket[id]; }, 0);
    }

    function updateCounts() {
      var count = totalItems();
      document.querySelectorAll('[data-cart-count]').forEach(function (node) {
        node.textContent = number.format(count);
        node.setAttribute('aria-label', labels.selectionCount(count));
      });
      if (selectionCount) selectionCount.textContent = labels.selectionCount(count);
      if (clearButton) clearButton.hidden = count === 0;
    }

    function createDialog(id, titleId) {
      var dialog = document.getElementById(id) || element('dialog', 'exp-dialog');
      dialog.id = id;
      dialog.classList.add('exp-dialog');
      dialog.setAttribute('aria-labelledby', titleId);
      dialog.setAttribute('aria-modal', 'true');
      if (!dialog.parentNode) document.body.appendChild(dialog);
      var shell = element('div', 'exp-dialog-shell');
      var close = button('exp-close', '×', labels.close);
      close.addEventListener('click', function () { closeDialog(dialog); });
      shell.appendChild(close);
      dialog.appendChild(shell);
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) {
          var rect = dialog.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
        }
      });
      dialog.addEventListener('close', function () {
        if (!document.querySelector('.exp-dialog[open]')) {
          document.body.classList.remove('exp-modal-open');
          if (dialog.returnFocus && dialog.returnFocus.isConnected) dialog.returnFocus.focus({ preventScroll: true });
        }
      });
      dialog.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && typeof dialog.close !== 'function') { event.preventDefault(); closeDialog(dialog); }
        if (event.key !== 'Tab') return;
        var focusable = Array.from(dialog.querySelectorAll('button, a[href], input, textarea, select, [tabindex="0"]')).filter(function (node) {
          return !node.disabled && node.getAttribute('aria-disabled') !== 'true' && node.getClientRects().length > 0;
        });
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
      return { dialog: dialog, shell: shell };
    }

    function showDialog(dialog, trigger) {
      if (dialog.open) return;
      dialog.returnFocus = trigger || document.activeElement;
      if (dialog.returnFocus && !dialog.returnFocus.getClientRects().length && menuButton) dialog.returnFocus = menuButton;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      document.body.classList.add('exp-modal-open');
      dialog.scrollTop = 0;
      var heading = dialog.querySelector('h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }

    function closeDialog(dialog) {
      if (typeof dialog.close === 'function') dialog.close();
      else {
        dialog.removeAttribute('open');
        document.body.classList.remove('exp-modal-open');
        if (dialog.returnFocus && dialog.returnFocus.isConnected) dialog.returnFocus.focus({ preventScroll: true });
      }
    }

    var order = createDialog('orderDialog', 'orderTitle');
    var orderHeader = element('div', 'exp-dialog-header');
    orderHeader.appendChild(element('span', 'exp-eyebrow', labels.eyebrow));
    var orderTitle = element('h2', '', labels.title);
    orderTitle.id = 'orderTitle';
    orderHeader.appendChild(orderTitle);
    orderHeader.appendChild(element('p', 'exp-intro', labels.intro));
    order.shell.appendChild(orderHeader);
    var selectionHeading = element('div', 'exp-selection-heading');
    var selectionCount = element('p', 'exp-selection-count');
    selectionCount.setAttribute('aria-live', 'polite');
    var clearButton = button('exp-clear', labels.clear);
    clearButton.addEventListener('click', function () {
      basket = Object.create(null);
      try { window.localStorage.removeItem(storageKey); }
      catch (error) { storageAvailable = false; }
      renderBasket();
      select.focus({ preventScroll: true });
      notify(labels.cleared);
    });
    selectionHeading.append(selectionCount, clearButton);
    order.shell.appendChild(selectionHeading);
    var basketList = element('div', 'exp-basket');
    order.shell.appendChild(basketList);

    var addRow = element('div', 'exp-add-row');
    var selectLabel = element('label', 'exp-sr', labels.choose);
    selectLabel.htmlFor = 'inquiryProduct';
    var select = element('select', 'exp-select');
    select.id = 'inquiryProduct';
    Object.keys(products).forEach(function (id) {
      var option = element('option', '', products[id].name);
      option.value = id;
      select.appendChild(option);
    });
    var addButton = button('exp-secondary', labels.add);
    addButton.addEventListener('click', function () { addProduct(select.value); });
    addRow.append(selectLabel, select, addButton);
    order.shell.appendChild(addRow);

    var optional = element('details', 'exp-optional');
    var optionalSummary = element('summary', '', labels.optional);
    optionalSummary.appendChild(element('span', '', labels.optionalHint));
    optional.appendChild(optionalSummary);
    var fields = element('div', 'exp-fields');
    function inputField(id, labelText, placeholder, multiline) {
      var wrapper = element('div', multiline ? 'exp-field exp-field-wide' : 'exp-field');
      var label = element('label', '', labelText);
      label.htmlFor = id;
      var input = element(multiline ? 'textarea' : 'input', 'exp-input');
      input.id = id;
      input.placeholder = placeholder;
      input.maxLength = multiline ? 600 : 80;
      if (multiline) input.rows = 3;
      else input.type = 'text';
      input.autocomplete = id === 'inquiryName' ? 'name' : id === 'inquiryCity' ? 'address-level2' : 'off';
      input.addEventListener('input', updateCheckout);
      wrapper.append(label, input);
      fields.appendChild(wrapper);
      return input;
    }
    var nameInput = inputField('inquiryName', labels.name, labels.namePlaceholder, false);
    var cityInput = inputField('inquiryCity', labels.city, labels.cityPlaceholder, false);
    var noteInput = inputField('inquiryNote', labels.note, labels.notePlaceholder, true);
    optional.appendChild(fields);
    order.shell.appendChild(optional);

    var status = element('p', 'exp-dialog-status');
    status.setAttribute('data-dialog-status', '');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    order.shell.appendChild(status);
    var checkoutArea = element('div', 'exp-checkout-area');
    var checkout = element('a', 'exp-primary exp-checkout', labels.checkout);
    checkout.target = '_blank';
    checkout.rel = 'noopener noreferrer';
    checkout.addEventListener('click', function (event) {
      if (!totalItems()) event.preventDefault();
      else updateCheckout();
    });
    checkoutArea.appendChild(checkout);
    checkoutArea.appendChild(element('p', 'exp-checkout-hint', labels.checkoutHint));
    order.shell.appendChild(checkoutArea);
    var privacyNote = element('p', 'exp-privacy', storageAvailable ? labels.privacy : labels.sessionOnly);
    order.shell.appendChild(privacyNote);

    function updateCheckout() {
      if (!checkout) return;
      var count = totalItems();
      checkout.setAttribute('aria-disabled', count ? 'false' : 'true');
      checkout.tabIndex = count ? 0 : -1;
      if (!count) { checkout.removeAttribute('href'); return; }
      var lines = [labels.messageIntro, ''];
      Object.keys(products).forEach(function (id) {
        if (basket[id]) lines.push('• ' + products[id].name + ' — ' + labels.messageQuantity + ': ' + basket[id]);
      });
      lines.push('');
      [[nameInput, labels.contactName], [cityInput, labels.contactCity], [noteInput, labels.contactNote]].forEach(function (field) {
        var value = field[0].value.trim().slice(0, field[0].maxLength);
        if (value) lines.push(field[1] + ': ' + value);
      });
      lines.push('', labels.messageEnd);
      checkout.href = 'https://wa.me/966503184880?text=' + encodeURIComponent(lines.join('\n'));
    }

    function renderBasket(focusId, focusControl) {
      basketList.replaceChildren();
      var ids = Object.keys(products).filter(function (id) { return basket[id]; });
      if (!ids.length) {
        var empty = element('div', 'exp-empty');
        var motif = element('span', 'exp-empty-mark', '✳');
        motif.setAttribute('aria-hidden', 'true');
        empty.append(motif, element('h3', '', labels.emptyTitle), element('p', '', labels.emptyText));
        var browse = button('exp-text-button', labels.browse + (english ? ' ↗' : ' ↖'));
        browse.addEventListener('click', function () {
          closeDialog(order.dialog);
          var productsSection = document.getElementById('products');
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
            var target = productsSection.querySelector('h2') || productsSection;
            target.setAttribute('tabindex', '-1');
            window.setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
          }
        });
        empty.appendChild(browse);
        basketList.appendChild(empty);
      }
      ids.forEach(function (id) {
        var product = products[id];
        var row = element('div', 'exp-item');
        var mark = element('span', 'exp-item-mark exp-mark-' + id, product.mark);
        mark.setAttribute('aria-hidden', 'true');
        var description = element('div', 'exp-item-description');
        description.appendChild(element('h3', '', product.name));
        description.appendChild(element('p', '', labels.packNote));
        var controls = element('div', 'exp-item-controls');
        var quantity = element('div', 'exp-quantity');
        function itemButton(control, text, label, handler) {
          var node = button(control === 'remove' ? 'exp-remove' : '', text, label + ' ' + product.name);
          node.dataset.itemId = id;
          node.dataset.itemControl = control;
          node.addEventListener('click', handler);
          return node;
        }
        var minus = itemButton('decrease', '−', labels.decrease, function () { setQuantity(id, basket[id] - 1, 'decrease'); });
        minus.disabled = basket[id] <= 1;
        var quantityInput = element('input');
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.max = String(maximumQuantity);
        quantityInput.step = '1';
        quantityInput.inputMode = 'numeric';
        quantityInput.value = basket[id];
        quantityInput.dataset.itemId = id;
        quantityInput.dataset.itemControl = 'quantity';
        quantityInput.setAttribute('aria-label', labels.quantity + ': ' + product.name);
        var plus = itemButton('increase', '+', labels.increase, function () { setQuantity(id, basket[id] + 1, 'increase'); });
        plus.disabled = basket[id] >= maximumQuantity;
        function syncTypedQuantity(finalize) {
          var value = Number(quantityInput.value);
          if (!finalize && (!quantityInput.value || !Number.isFinite(value) || value < 1)) return;
          if (!Number.isFinite(value) || value < 1) value = 1;
          value = Math.max(1, Math.min(maximumQuantity, Math.floor(value)));
          basket[id] = value;
          if (finalize) quantityInput.value = value;
          minus.disabled = value <= 1;
          plus.disabled = value >= maximumQuantity;
          persistBasket();
          updateCounts();
          updateCheckout();
        }
        // Keep this row mounted: replacing it on blur swallows an adjacent click.
        quantityInput.addEventListener('input', function () { syncTypedQuantity(false); });
        quantityInput.addEventListener('change', function () { syncTypedQuantity(true); });
        quantity.append(minus, quantityInput, plus);
        var remove = itemButton('remove', labels.remove, labels.remove, function () {
          delete basket[id];
          persistBasket();
          renderBasket();
          var nextRemove = basketList.querySelector('[data-item-control="remove"]');
          (nextRemove || select).focus({ preventScroll: true });
          notify(product.name + ' — ' + labels.removed);
        });
        controls.append(quantity, remove);
        row.append(mark, description, controls);
        basketList.appendChild(row);
      });
      updateCounts();
      updateCheckout();
      if (focusId && focusControl) {
        var focus = basketList.querySelector('[data-item-id="' + focusId + '"][data-item-control="' + focusControl + '"]');
        if (focus && focus.disabled) focus = basketList.querySelector('[data-item-id="' + focusId + '"][data-item-control="quantity"]');
        if (focus) focus.focus({ preventScroll: true });
      }
    }

    function setQuantity(id, quantity, control) {
      if (!Object.prototype.hasOwnProperty.call(products, id)) return;
      basket[id] = Math.max(1, Math.min(maximumQuantity, quantity));
      persistBasket();
      renderBasket(id, control);
    }

    function addProduct(id) {
      if (!Object.prototype.hasOwnProperty.call(products, id)) return;
      if (basket[id] >= maximumQuantity) { notify(labels.max); return; }
      basket[id] = (basket[id] || 0) + 1;
      persistBasket();
      renderBasket();
      notify(products[id].name + ' — ' + labels.added);
    }

    var detail = createDialog('productDialog', 'productDialogTitle');
    detail.dialog.classList.add('exp-product-dialog');
    var detailContent = element('div', 'exp-product-content');
    detail.shell.appendChild(detailContent);

    function showDetails(id, trigger) {
      if (!Object.prototype.hasOwnProperty.call(products, id)) return;
      var product = products[id];
      detailContent.replaceChildren();
      var art = element('div', 'exp-detail-art exp-mark-' + id);
      art.appendChild(element('span', 'exp-detail-number', product.mark));
      art.appendChild(element('span', 'exp-detail-star', '✳'));
      art.setAttribute('aria-hidden', 'true');
      var content = element('div', 'exp-detail-copy');
      content.appendChild(element('span', 'exp-eyebrow', product.tag));
      var heading = element('h2', '', product.name);
      heading.id = 'productDialogTitle';
      content.appendChild(heading);
      content.appendChild(element('p', 'exp-detail-description', product.description));
      var care = element('div', 'exp-care');
      care.append(element('h3', '', labels.careTitle), element('p', '', product.care));
      content.appendChild(care);
      content.appendChild(element('p', 'exp-availability', labels.availability));
      var add = button('exp-primary', labels.inquire + ' +');
      add.addEventListener('click', function () {
        var origin = detail.dialog.returnFocus;
        closeDialog(detail.dialog);
        showDialog(order.dialog, origin);
        addProduct(id);
      });
      content.appendChild(add);
      var live = element('span', 'exp-sr');
      live.setAttribute('data-dialog-status', '');
      live.setAttribute('role', 'status');
      content.appendChild(live);
      detailContent.append(art, content);
      showDialog(detail.dialog, trigger);
    }

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-order], [data-details]');
      if (!trigger) return;
      event.preventDefault();
      if (trigger.hasAttribute('data-details')) showDetails(trigger.dataset.details, trigger);
      else {
        showDialog(order.dialog, trigger);
        if (trigger.dataset.order) addProduct(trigger.dataset.order);
      }
    });

    var filters = Array.from(document.querySelectorAll('[data-filter]'));
    var cards = Array.from(document.querySelectorAll('[data-product-category]'));
    var countNode = document.getElementById('productCount');
    function filterProducts(filter) {
      var visible = 0;
      cards.forEach(function (card) {
        var show = filter === 'all' || card.dataset.productCategory.split(' ').indexOf(filter) !== -1;
        card.hidden = !show;
        if (show) visible += 1;
      });
      filters.forEach(function (node) {
        var active = node.dataset.filter === filter;
        node.setAttribute('aria-pressed', String(active));
        node.classList.toggle('is-active', active);
        node.classList.toggle('active', active);
      });
      if (countNode) countNode.textContent = labels.count(visible);
    }
    if (countNode) { countNode.setAttribute('aria-live', 'polite'); countNode.setAttribute('aria-atomic', 'true'); }
    filters.forEach(function (node) { node.addEventListener('click', function () { filterProducts(node.dataset.filter); }); });
    if (cards.length) filterProducts('all');

    var menuButton = document.getElementById('menuBtn');
    var mobileNav = document.getElementById('mobileNav');
    function closeMenu(returnFocus) {
      if (!menuButton || !mobileNav) return;
      mobileNav.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
      if (returnFocus) menuButton.focus();
    }
    if (menuButton && mobileNav) {
      menuButton.setAttribute('aria-controls', 'mobileNav');
      menuButton.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
      menuButton.addEventListener('click', function () {
        var opening = mobileNav.hidden;
        mobileNav.hidden = !opening;
        menuButton.setAttribute('aria-expanded', String(opening));
        document.body.classList.toggle('nav-open', opening);
      });
      mobileNav.addEventListener('click', function (event) {
        if (event.target.closest('a, [data-order]')) closeMenu(false);
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !mobileNav.hidden && !document.querySelector('.exp-dialog[open]')) closeMenu(true);
      });
      document.addEventListener('click', function (event) {
        if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu(false);
      });
      window.addEventListener('resize', function () { if (menuButton.getClientRects().length === 0) closeMenu(false); }, { passive: true });
    }

    var header = document.getElementById('siteHeader');
    if (header) {
      function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 20); }
      window.addEventListener('scroll', updateHeader, { passive: true });
      updateHeader();
    }
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if ('IntersectionObserver' in window && !reducedMotion.matches) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('exp-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.reveal').forEach(function (node) { observer.observe(node); });
    }
    window.addEventListener('storage', function (event) {
      if (event.key !== storageKey && event.key !== null) return;
      try { basket = validBasket(JSON.parse(event.newValue)); }
      catch (error) { basket = Object.create(null); }
      renderBasket();
      if (order.dialog.open) notify(labels.updated);
    });
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
    renderBasket();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
