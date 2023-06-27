function Design() {  
    var selectedLang = localStorage.getItem('selectedLang') || 'zh';
    return fetch(`lang/${selectedLang}.json`, {
            headers: {
                'If-Modified-Since': 'Thu, 01 Jun 2019 00:00:00 GMT',
                'Cache-Control': 'max-age=3600'
            }
        })
        .then(res => res.json())
        .catch(err => {
            console.error(err);
            document.body.innerHTML = '';
            return {};
        });
  }
  Design().then(data => {
        let typed = 0;
        let Data = data['data'];
        let header = $('.header');
        let headerShop = data['header'][0];
        let footer = data['footer'][0];
        let swiperWrapper = $('.swiper-wrapper');
        let container = $('#container');
        let body = $('body')
        const hotHtml = headerShop.hot.map(hot => {
            let imgHtml = hot.img ? `<img class="hot-icon" src="${hot.img}" alt="" />` : '';
            let iconHtml = hot.icon ? `<span class="isNew">${hot.icon}</span>` : '';
            return `<li><a target="_blank" href="${hot.url}">${imgHtml}${hot.title}</a>${iconHtml}</li>`;
        }).join('');
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        const matchingDates = Data.reduce((acc, question) => acc.concat(question.children.map(child => child.new)), []).filter(date => date === dateStr);
        const matchingCount = matchingDates.length;
        const updateTitle = data.update[matchingCount > 0 ? 0 : 1].title;
        const updateli = `<li><a target="_blank" href="javascript:void(0)">${updateTitle}</a><span class="many">${matchingCount}</span></li>`;
        let headerHtml = `<span class="bg-gradient-dark opacity-60"></span><div class="title-center">
                        <h1 class="text-white title">Design Notes</h1>
                        <p class="text-muted mt-3 mb-5">${headerShop.text}</p>
                        </div>
                        <div class="search-wraper ">
                            <input type="text" id="search" class="form-control search" placeholder="" autocomplete="off" autofocus="on" tabindex="0" autocorrect="off" autocapitalize="off" spellcheck="false" value onclick="startConfetti()">
                            <span class="search-icon"></span> 
                            <span class="bi-x-lg"></span>
                        </div>
                        <ul class="mt-4 mb-4 search-suggestions">
                            <li>${headerShop.title}</li>${hotHtml} ${updateli} 
                        </ul>
                        <div class="hero-link">
                        <a target="_blank" class="Website" href="https://link.sunyang.vip">${headerShop.website}</a>
                        </div>`;
        header.html(headerHtml);
       
        const previousState = localStorage.getItem('currentState');
        const searchhot = localStorage.getItem('searchsuggestion');
        for (let i in Data) {
            let subData = Data[i];
            let questionName = subData['questionName'];
            let number = subData['children'].length;
            typed += number;
            let activeClass = '';
            if (!searchhot && !previousState) {
                activeClass = subData === Data[0] ? 'navigation' : '';
            }
            let slideHtml = `
                <div class="swiper-slide clearfix"><a class="${activeClass}" href="javascript:void(0);" data-banner="banner-${i}">${questionName}</a></div>`;
            swiperWrapper.append(slideHtml);
        }
        $(".text-muted span").html(typed);

   
        let dataIndex = 0;
        if (previousState) {
            let bannerInfoArray = previousState.split('-');
            dataIndex = bannerInfoArray[1];
            $(`.swiper-slide a[data-banner="${previousState}"]`).addClass("navigation");
        }

        let searchInput = $('#search');
        let clearButton = $('.bi-x-lg');
        let swiperslide = $(".swiper-slide a");
        swiperslide.on("click", function() {
            let swiperData = $(this).attr("data-banner");
            let bannerInfoArray = swiperData.split('-');
            let { questionName: name, children } = Data[bannerInfoArray[1]]; 
            let childrenHtml = children.sort(sortByGood).map(child => generateChildHtml(child, name)).join('');
            localStorage.setItem('currentState', swiperData);
            localStorage.removeItem('searchsuggestion');
            container.html(childrenHtml);
            searchInput.val('');
            clearButton.hide();
            swiperslide.removeClass("navigation");
            $(this).addClass("navigation");
            lazyLoadImages();
            $('[data-bs-toggle="tooltip"]').tooltip();
        });

        var swiper = new Swiper('.swiper-container', {
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev',
            slidesPerView: 'auto',
            mousewheelControl: true, 
            simulateTouch: true, 
            onInit: function(swiper) {
                $('.swiper-container').addClass("gradientRt");
            },
            onTransitionStart: function(swiper) {
                if (swiper.isBeginning) {
                    $('.swiper-container').removeClass("gradientLt");
                } else {
                    $('.swiper-container').addClass("gradientLt");
                }
                if (swiper.isEnd) {
                    $('.swiper-container').removeClass("gradientRt");
                } else {
                    $('.swiper-container').addClass("gradientRt");
                };
            },
        });
        swiper.slideTo(dataIndex);
     
        let searchsuggestions = $(".search-suggestions li a");
        searchsuggestions.click(function(e) {
        e.preventDefault(); 
        var href = $(this).attr("href"); 
        var searchhot = $(this).text();
        var many = $(this).siblings(".many").text();
        if (href !== "javascript:void(0)") {
            window.open(href, '_blank');
        } else {
            if (many) {  
            searchInput.val('');  
            debounceSearch(dateStr);
            } else {
            searchInput.val(searchhot);  
            searchInput.trigger('input');
            }
        }
        let index = searchsuggestions.index(this);
        if (index !== 2 && index !== 4 && index !== 5 ) {
            localStorage.setItem('searchsuggestion', searchhot);
            localStorage.removeItem('currentState');
        }else if(index === 5){
            localStorage.removeItem('searchsuggestion');
        }
        });

        function debounceSearch(inputValue) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                search(inputValue);
                this.lastInputValue = inputValue;
            }, 300);
        }

        searchInput.on('input', function() {
            let inputValue = $.trim($(this).val().toLowerCase());
            if (inputValue !== '') {
                clearButton.show();
                $('#loading').addClass('show');
                clearButton.click(() => {
                    searchInput.val('');
                    clearButton.hide();
                    localStorage.removeItem('searchsuggestion');
                });
                localStorage.setItem('searchsuggestion', inputValue);
                localStorage.removeItem('currentState');
                debounceSearch(inputValue);
            } else {
                clearButton.hide();
                localStorage.removeItem('searchsuggestion');
            }
        });

        if (!searchhot) {
            const { questionName: name, children } = Data[dataIndex];
            const childrenHtml = children.sort(sortByGood).map(child => generateChildHtml(child, name)).join('');
            container.html(childrenHtml);
            lazyLoadImages();
        }else {
            searchInput.val(searchhot);
            searchInput.trigger('input');
        }
        
        function search(keyword) {
        var result = [];
        swiperslide.removeClass("navigation");
        var formattedKeyword = keyword.trim().toLowerCase();
        Data.forEach(function (question) {
            var searchItems = question.children;
            searchItems.forEach(function (item) {
            var questionTxtLowerCase = item.questionTxt ? item.questionTxt.toLowerCase() : '';
            var titleLowerCase = item.title ? item.title.toLowerCase() : '';
            var txtLowerCase = item.txt ? item.txt.toLowerCase() : '';
            var iconLowerCase = item.icon ? item.icon.toLowerCase() : '';
            var goodLowerCase = item.good ? item.good.toLowerCase() : '';
            var newLowerCase = item.new ? item.new.toLowerCase() : '';  
            if (
                questionTxtLowerCase.includes(formattedKeyword) ||
                titleLowerCase.includes(formattedKeyword) ||
                txtLowerCase.includes(formattedKeyword) ||
                iconLowerCase.includes(formattedKeyword) ||
                goodLowerCase.includes(formattedKeyword) ||
                newLowerCase.includes(formattedKeyword) 
            ) {
                result.push({ item: item, parentName: question.questionName });
            }
            });
        });
        if (result.length) {
            let childrenHtml = result.sort(sortByGood).map(({ item, parentName }) => generateChildHtml(item, parentName)).join('');
            $('#container').html(childrenHtml);
            $('[data-bs-toggle="tooltip"]').tooltip();
        } else {
            var error = '<div class="text-center error pt-5"><h1 class="glitch" title="404">404</h1><p>暂时木有内容呀~</p></div>';
            $("#container").html(error);
        }
            lazyLoadImages();
            $('#loading').removeClass('show'); 
        }

        function sortByGood(a, b) {
            const aGood = a.item ? a.item.good : a.good;
            const bGood = b.item ? b.item.good : b.good;
            if (aGood && bGood) {
                return bGood - aGood;
            } else if (aGood) {
                return -1;
            } else if (bGood) {
                return 1;
            } else {
                return 0;
            }
        }

        function generateChildHtml(child, name) {
            const iconHtml = child.icon ? `<em class="box-vpn vpn" data-text="${child.icon}">${child.icon}</em>` : '';
            const goodHtml = child.good ? `<em class="box-vpn" data-text="${child.good}">${child.good}</em>` : '';
            return `
                <div class="col-xl-3 col-lg-6 child-item">
                    <a href="${child.url}" target="_blank" class="fade-in d-flex align-items-center my-3 rounded-6 p-4 box" rel="nofollow" questionName="${name}">
                        <div class="box-img rounded-circle"><img class="mr-3 lazy" data-src="${child.img}" alt=""></div>
                        <div class="lh-100 overflow-hidden">
                            <div class="d-flex">
                                <h6 class="mb-0 lh-100 box-h6">${child.title}</h6>${goodHtml}${iconHtml}
                            </div>
                            <small class="box-small my-1 mb-0" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="${child.txt}">${child.txt}</small>
                        </div>
                    </a>
                </div>
            `;
        }

        function lazyLoadImages() {
            const lazyImages = document.querySelectorAll('img.lazy');
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.setAttribute('src', img.getAttribute('data-src'));
                    img.classList.add('lazy-loaded');
                    observer.unobserve(img);
                }
                });
            });
            lazyImages.forEach(img => {
                observer.observe(img);
            });
        }

        let footerhtml = `
            <div class="p-3 p-lg-2 fixed-bottom bg-body toasts-show toasts-top navbar-expand-lg" id="toasts-box">
                <div class="container-fluid" id="footer">
                <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start toasts-text">
                    <div class="collapse navbar-collapse" id="navbarsExample06">
                        <ul class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0"></ul>
                    </div>
                    <p class="col-12 col-lg-auto mb-2 mb-lg-0 me-lg-3 text-center"><img class="toasts-gif" src="./images/icon/1f44b.gif" alt=""></p>
                    <div class="text-end dropup"></div>
                </div>
                </div>
            </div>`
        body.append(footerhtml);
        const links = footer.links;
        const linkList = document.querySelector('.nav');
        links.forEach((link, index) => {
            const listItem = document.createElement('li');
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', link.url);
            linkElement.setAttribute('class', 'nav-link link-dark px-2');
            if (index !== 0) {
                linkElement.setAttribute('target', '_blank');
            }
            linkElement.setAttribute('rel', 'nofollow');
            if (index === 0) {
                const strongElement = document.createElement('strong');
                strongElement.setAttribute('class', 'h6 fw-bold logo-ff');
                strongElement.textContent = link.title;
                linkElement.appendChild(strongElement);
            } else {
                linkElement.textContent = link.title;
            }
            listItem.appendChild(linkElement);
            linkList.appendChild(listItem);
        });
        const wechat = footer.wechat[0];
        const wechatItem = document.createElement('li');
        wechatItem.setAttribute('class', 'nav-item dropup');
        wechatItem.innerHTML = `
        <a class="nav-link dropdown-toggle ft-wx" href="#" data-bs-toggle="dropdown" aria-expanded="false">${wechat.title}</a>
        <ul class="dropdown-menu">
            <li><img class="w-100" src="${wechat.img}" alt="${wechat.title}"></li>
        </ul>`;
        linkList.appendChild(wechatItem);
        // const qq = footer.qq[0];
        // const qqItem = document.createElement('li');
        // qqItem.setAttribute('class', 'nav-item dropup');
        // qqItem.innerHTML = `
        // <a class="nav-link dropdown-toggle ft-wx" href="#" data-bs-toggle="dropdown" aria-expanded="false">${qq.title}</a>
        // <ul class="dropdown-menu">
        //     <li><img class="w-100" src="${qq.img}" alt="${qq.title}"></li>
        // </ul>`;
        // linkList.appendChild(qqItem);
        const helpcenter = footer.helpcenter[0];
        const helpcenterItem = document.createElement('li');
        helpcenterItem.setAttribute('class', 'nav-item dropup');
        helpcenterItem.innerHTML = `<a class="nav-link dropdown-toggle gd" href="#" data-bs-toggle="dropdown" aria-expanded="false">${helpcenter.title}</a>`;
        const helpcenterList = document.createElement('ul');
        helpcenterList.setAttribute('class', 'dropdown-menu');
        helpcenter.dropdown.forEach(item => {
        const listItem = document.createElement('li');
        if (item.title === '关闭广告 - 24h' || item.title === 'Close advertisement - 24h') {
            const hr = document.createElement('hr');
            hr.setAttribute('class', 'dropdown-divider');
            helpcenterList.appendChild(hr);
        }
        if (item.url) {
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', item.url);
            if (item['data-bs-toggle']) {
            linkElement.setAttribute('data-bs-toggle', item['data-bs-toggle']);
            }
            if (item['data-bs-target']) {
            linkElement.setAttribute('data-bs-target', item['data-bs-target']);
            }
            if (item['aria-controls']) {
            linkElement.setAttribute('aria-controls', item['aria-controls']);
            }
            if (item.id) {
            linkElement.setAttribute('id', item.id);
            }
            linkElement.setAttribute('class', 'dropdown-item');
            if (item.title !== '关闭广告 - 24h' && item.title !== 'Close advertisement - 24h') {
            linkElement.setAttribute('target', '_blank');
            linkElement.setAttribute('rel', 'nofollow');
            }
            linkElement.textContent = item.title;
            listItem.appendChild(linkElement);
        } else {
            listItem.innerHTML = `<a class="dropdown-item" id="${item.id}" href="#">${item.title}</a>`;
        }
        helpcenterList.appendChild(listItem);
        });
        helpcenterItem.appendChild(helpcenterList);
        linkList.appendChild(helpcenterItem);
        const language = footer.language;
        const languageItem = document.createElement('li');
        languageItem.setAttribute('class', 'nav-item dropup');
        languageItem.innerHTML = `<a id="language-selector" class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">${language[0].title}</a>`;
        const languageList = document.createElement('ul');
        languageList.setAttribute('class', 'dropdown-menu border-0 languageCodes-li');
        language.forEach(lang => {
        const listItem = document.createElement('li');
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', '#');
        linkElement.setAttribute('data-lang', lang.lang);
        linkElement.setAttribute('class', 'dropdown-item');
        linkElement.textContent = lang.title;
        listItem.appendChild(linkElement);
        languageList.appendChild(listItem);
        });
        languageItem.appendChild(languageList);
        linkList.appendChild(languageItem);
        const service = footer.service[0];
        const serviceItem = document.createElement('li');
        serviceItem.innerHTML = `<a target="_blank" href="${service.url}" class="nav-link link-dark px-2 service">${service.title}</a>`;
        linkList.appendChild(serviceItem);
        const textElement = document.querySelector('.toasts-gif');
        textElement.insertAdjacentHTML('afterend', footer.text);
        let buttonData = footer.button;
        let buttonHtml = buttonData.map(button => {
            let attributes = Object.entries(button)
                .filter(([key]) => key !== 'title')
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
            if (button.title === '在线客服' || button.title === 'Live Chat') {
                // attributes += ' target="_blank"';
                attributes += 'onclick="openCrispChat()"';
            }
            return `<a ${attributes}>${button.title}</a>`;
        }).join('');
        $('.text-end.dropup').html(buttonHtml);
        //滑动显示/隐藏
        const element = document.querySelector('.fixed-bottom')
        let lastScrollTop = 0;
        let ticking = false;
        function update() {
            lastScrollTop = window.scrollY;
            if (lastScrollTop === 0) {
                element.classList.replace('toasts-bottom', 'toasts-top');
            } else {
                element.classList.replace('toasts-top', 'toasts-bottom');
            }
            ticking = false;
            }
            window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        });
        //定时显示/隐藏
        const ONE_DAY =  24 * 60 * 60 * 1000;
        const closePopupBtn = document.querySelector('#toasts-close');
        const popup = document.querySelector('#toasts-box');
        closePopupBtn.addEventListener('click', () => {
        popup.classList.add('toasts-none-bottom'); 
        popup.addEventListener('transitionend', () => {
            popup.style.display = 'none';
        }, {once: true});
            localStorage.setItem('popupClosed', Date.now());
        });  
        const lastClosed = localStorage.getItem('popupClosed');
            if (lastClosed && Date.now() - lastClosed < ONE_DAY) { 
            popup.style.display = 'none';
        }else{
            localStorage.removeItem('popupClosed');
        }
        //语言切换
        var languageSelector = document.querySelector('#language-selector');
        var languageItems = document.querySelectorAll('.languageCodes-li a');
        function updateLanguage(selectedLang) {
            languageSelector.textContent = Array.from(languageItems).find(item => item.getAttribute('data-lang') === selectedLang).textContent;
            localStorage.setItem('selectedLang', selectedLang);
            if (selectedLang === 'en') {
                document.querySelector('.min-vh').style.height = '580px';
            }
            languageItems.forEach(function(item) {
            if (item.getAttribute('data-lang') === selectedLang) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
            });
        }
        languageItems.forEach(function(item) {
            item.addEventListener('click', function(event) {
            event.preventDefault();
            var selectedLang = event.target.getAttribute('data-lang');
            updateLanguage(selectedLang);
            location.reload();
            });
        });
        var storedLanguage = localStorage.getItem('selectedLang');
        if (storedLanguage) {updateLanguage(storedLanguage);}
        $('[data-bs-toggle="tooltip"]').tooltip();
    })
    .catch(err => {
        console.error(err);
});
