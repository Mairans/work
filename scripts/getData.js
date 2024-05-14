import { API_URL, LOCATION_URL, VACANCY_URL, } from './constants.js'

const cardsList = document.querySelector('.cards__list');

let lastUrl = '';
let pagination = {};    

const createCard = vacancy => `
<article class="vacancy" tabindex="0" data-id="${vacancy.id}">
<img class="vacancy__img" src="${API_URL}${vacancy.logo}" alt="${vacancy.company}">
<p class="vacancy__company">${vacancy.company}</p>
<h3 class="vacancy__title">${vacancy.title}</h3>
<ul class="vacancy__fields">
    <li class="vacancy__field">От ${parseInt(vacancy.salary).toLocaleString()}Р</li>
    <li class="vacancy__field">${vacancy.format}</li>
    <li class="vacancy__field">${vacancy.type}</li>
    <li class="vacancy__field">${vacancy.experience}</li>
</ul>
</article>
`;

const createCards = (data) => {
    return data.vacancies.map(vacancy => {
        const li = document.createElement('li');
        li.classList.add('cards__item');
        li.insertAdjacentHTML('beforeend', createCard(vacancy))
        return li;
    })
}

const renderVacancy = (data) => {
    cardsList.textContent = "";
    const cards = createCards(data);
    cardsList.append(...cards);

    if (data.pagination) {
        Object.assign(pagination, data.pagination);
    }

    observer.observe(cardsList.lastElementChild);
}

const renderMoreVacancy = (data) => {
    const cardsList = document.querySelector('.cards__list');
    const cards = createCards(data);
    cardsList.append(...cards);

    if (data.pagination) {
        Object.assign(pagination, data.pagination);
    }

    observer.observe(cardsList.lastElementChild);
}

const loadMoreVacancies = () => {
    if (pagination.totalPages > pagination.currentPage) {
        const urlWithParams = new URL(lastUrl);
        urlWithParams.searchParams.set('page', pagination.currentPage + 1);
        urlWithParams.searchParams.set('limit', window.innerWidth < 768 ? 6 : 12);

        getData(urlWithParams, renderMoreVacancy, renderError).then(() => {
            lastUrl = urlWithParams;
        });
    }
}

const renderError = err => {
    console.warn(err)
}

const creatreDetailVacancy = ({ id,
    title,
    company,
    description,
    email,
    salary,
    type,
    format,
    experience,
    location,
    logo }) => `
    <article class="detail">
        <div class="detail__header">
            <img class="detail__logo" src="${API_URL}${logo}" alt="${company}">
            <p class="detail__company">${company}</p>
            <h2 class="detail__title">${title}</h2>
</div>

<div class="detail__main">
<p class="detail__description">${description.replaceAll('\n', "<br>")}</p>
    <ul class="detail__fields">
        <li class="detail__field">от ${parseInt(salary).toLocaleString()}₽</li>
        <li class="detail__field">${type}</li>
        <li class="detail__field">${format}</li>
        <li class="detail__field">${experience}</li>
        <li class="detail__field">${location}</li>
    </ul>
</div>
<p class="detail__resume">Отправляйте резюме на
    <a class="blue__text" href="mailto:${email}">${email}</a>
</p>
</article>
`

const renderModal = data => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const modalMain = document.createElement('div');
    modalMain.classList.add('modal__main')
    modalMain.innerHTML = creatreDetailVacancy(data);
    const modalClose = document.createElement('button');
    modalClose.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M6.7831 6L11.3887 1.39444C11.4797 1.28816 11.5272 1.15145 11.5218 1.01163C11.5164 0.871815 11.4585 0.739182 11.3595 0.640241C11.2606 0.541299 11.128 0.483337 10.9881 0.477936C10.8483 0.472535 10.7116 0.520094 10.6053 0.611109L5.99977 5.21666L1.39421 0.605553C1.2896 0.50094 1.14771 0.442169 0.999768 0.442169C0.851823 0.442169 0.709937 0.50094 0.605324 0.605553C0.50071 0.710167 0.441939 0.852053 0.441939 0.999998C0.441939 1.14794 0.50071 1.28983 0.605324 1.39444L5.21643 6L0.605324 10.6056C0.547167 10.6554 0.499934 10.7166 0.466587 10.7856C0.433241 10.8545 0.414502 10.9296 0.411547 11.0061C0.408592 11.0826 0.421483 11.1589 0.449414 11.2302C0.477344 11.3015 0.51971 11.3662 0.573851 11.4204C0.627993 11.4745 0.692741 11.5169 0.764033 11.5448C0.835325 11.5727 0.91162 11.5856 0.988131 11.5827C1.06464 11.5797 1.13972 11.561 1.20864 11.5276C1.27757 11.4943 1.33885 11.447 1.38866 11.3889L5.99977 6.78333L10.6053 11.3889C10.7116 11.4799 10.8483 11.5275 10.9881 11.5221C11.128 11.5167 11.2606 11.4587 11.3595 11.3598C11.4585 11.2608 11.5164 11.1282 11.5218 10.9884C11.5272 10.8485 11.4797 10.7118 11.3887 10.6056L6.7831 6Z"
        fill="#CCCCCC" />
</svg>
    `
    modalClose.classList.add('modal__close')
    modalMain.append(modalClose);
    modal.append(modalMain);
    document.body.append(modal);
    modal.addEventListener('click', ({ target }) => {
        if (target == modal || target.closest('.modal__close')) {
            modal.remove();
        }
    })
}

const openModal = (id) => {
    getData(`${API_URL}${VACANCY_URL}/${id}`, renderModal, renderError)
}

const getData = async (url, cbSucces, cbError) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        cbSucces(data)
    } catch (error) {
        cbError(error)
    }
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadMoreVacancies();
        }
    })
},
    {
        rootMargin: '100px'
    }
);

const openFilter = (btn, dropDown, classNameBtn, classNameDrop) => {
    dropDown.style.height = `${dropDown.scrollHeight}px`
    btn.classList.add(classNameBtn)
    dropDown.classList.add(classNameDrop)

}

const closeFilter = (btn, dropDown, classNameBtn, classNameDrop) => {
    btn.classList.remove(classNameBtn)
    dropDown.classList.remove(classNameDrop)
    dropDown.style.height = '';
}

export const init = () => {
    const filterForm = document.querySelector('.filter__form');
    const vacanciesFilterBtn = document.querySelector('.vacancies__filter-btn');
    const vacanciesFilter = document.querySelector('.vacancies__filter');

    // open filter 
    vacanciesFilterBtn.addEventListener('click', () => {
        if (vacanciesFilterBtn.classList.contains('vacancies__filter-btn_active')) {
            closeFilter(vacanciesFilterBtn, vacanciesFilter, 'vacancies__filter-btn_active', 'vacancies__filter-active')
        } else {
            openFilter(vacanciesFilterBtn, vacanciesFilter, 'vacancies__filter-btn_active', 'vacancies__filter-active')
        }
    })

    window.addEventListener('resize', () => {
        if (vacanciesFilterBtn.classList.contains('vacancies__filter-btn_active')) {
            // vacanciesFilter.style.height = `${vacanciesFilter.scrollHeight}px`;
            closeFilter(vacanciesFilterBtn, vacanciesFilter, 'vacancies__filter-btn_active', 'vacancies__filter-active')
        }
    })

    // Select city
    const city = document.getElementById('city');
    const choices = new Choices(city, {
        itemSelectText: '',
    });


    getData(`${API_URL}${LOCATION_URL}`,
        (locationData) => {
            const locations = locationData.map(location => ({
                value: location,
            }));
            choices.setChoices(locations, 'value', 'label', true)
        },
        (error) => {
            console.log(error)
        });

    // cards
    const url = new URL(`${API_URL}${VACANCY_URL}`);

    url.searchParams.set('limit', window.innerWidth < 768 ? 6 : 12);
    url.searchParams.set('page', 1);

    getData(url, renderVacancy, renderError).then(() => {
        lastUrl = url;
    });

    cardsList.addEventListener('click', ({ target }) => {
        const vacancyCard = target.closest(".vacancy");
        if (vacancyCard) {
            const vacancyId = vacancyCard.dataset.id;
            openModal(vacancyId);
        }
    })

    cardsList.addEventListener('keydown', ({ code, target }) => {
        const vacancyCard = target.closest(".vacancy");
        if (code === "Enter" && target.closest('.vacancy')) {
            const vacancyId = vacancyCard.dataset.id;
            openModal(vacancyId);
        }
    })

    // filter
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);

        const urlWithParam = new URL(`${API_URL}${VACANCY_URL}`)

        formData.forEach((value, key) => {
            urlWithParam.searchParams.set(key, value)
        })

        getData(urlWithParam, renderVacancy, renderError).then(() => {
            lastUrl = urlWithParam;
        });
    });
};