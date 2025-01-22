<template>
  <div>
    <div class="full-width-bar">
      <div class="bar-content">
        <router-link to="/offers" class="bar-item">OFFER</router-link>
      </div>
    </div>

    <div class="container">
      <!-- Кнопка для открытия формы добавления -->
      <button @click="showForm = true" class="button is-medium is-fullwidth mb-5 add-offer-button">
        <span class="icon">
          <i class="fas fa-plus"></i>
        </span>
        <span>Добавить Оффер</span>
      </button>

      <!-- Поле для поиска офферов -->
      <div class="field mb-5">
        <label class="label">Поиск офферов</label>
        <div class="control">
          <input v-model="searchQuery" class="input" type="text" placeholder="Введите текст для поиска..." />
        </div>
      </div>

      <!-- Форма для добавления нового оффера -->
      <div v-if="showForm" class="modal is-active">
        <div class="modal-background" @click="cancelForm"></div>
        <div class="modal-content">
          <div class="field">
            <label class="label">Оффер</label>
            <div class="control">
              <input v-model="newOffer.offer" class="input" type="text" placeholder="Название оффера" />
            </div>
          </div>
          <div class="field">
            <label class="label">Гео</label>
            <div class="control">
              <div class="select">
                <select v-model="newOffer.geo" @change="setCountryCode">
                  <option value="">Выберите страну</option>
                  <option v-for="geo in geoData" :key="geo.code" :value="geo.name">
                    {{ geo.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Цена</label>
            <div class="control">
              <input v-model="newOffer.price" class="input" type="number" placeholder="Цена" />
            </div>
          </div>
          <div class="field">
            <label class="label">Скидка</label>
            <div class="control">
              <input v-model="newOffer.discount" class="input" type="number" placeholder="Скидка (%)" />
            </div>
          </div>
          <div class="field">
            <label class="label">Текст кнопки</label>
            <div class="control">
              <input v-model="newOffer.buttonText" class="input" type="text" placeholder="Текст кнопки" />
            </div>
          </div>
          <div class="field">
            <label class="label">Описание</label>
            <div class="control">
              <input v-model="newOffer.description" class="input" type="text" placeholder="Описание" />
            </div>
          </div>
          <div class="field">
            <label class="label">Изображение</label>
            <div class="control">
              <input v-model="newOffer.image" class="input" type="url" placeholder="Ссылка на изображение" />
            </div>
          </div>

          <button @click="addOffer" class="button is-primary">Добавить</button>
          <button @click="cancelForm" class="button is-light">Отмена</button>
        </div>
        <button class="modal-close is-large" aria-label="close" @click="cancelForm"></button>
      </div>

      <!-- Таблица офферов -->
      <table class="table is-fullwidth is-bordered is-striped is-hoverable has-background-light">
        <thead>
        <tr>
          <th>Оффер</th>
          <th>Гео</th>
          <th>Цена</th>
          <th>Скидка (%)</th>
          <th>Текст кнопки</th>
          <th>Описание</th>
          <th>Изображение</th>
          <th>Ссылка Оффера</th>
          <th>Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="offer in paginatedOffers" :key="offer.id">
          <td>{{ offer.offer }}</td>
          <td>{{ offer.geo }}</td>
          <td>{{ offer.price }}</td>
          <td>{{ offer.discount }}</td>
          <td>{{ offer.buttonText || 'Нет текста' }}</td>
          <td>{{ offer.description }}</td>
          <td>
            <a :href="offer.image" target="_blank">
                <span class="icon">
                  <i class="fas fa-image"></i>
                </span>
            </a>
          </td>
          <td>
            <div class="open-link-container">
              <a :href="`${apiBaseUrl}/static/offers/offer_${offer.id}.html`" target="_blank">
                <button class="button open-link is-small is-rounded">
                  <span>Открыть</span>
                </button>
              </a>
            </div>
          </td>
          <td>
            <button @click="deleteOffer(offer.id)" class="button is-danger is-small is-rounded">
              <span>Удалить</span>
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Пагинация -->
      <nav class="pagination is-centered" role="navigation" aria-label="pagination">
        <a class="pagination-previous"
           :disabled="currentPage === 1"
           @click="changePage(currentPage - 1)"
           :class="{'disabled': currentPage === 1}">
          Назад
        </a>
        <a class="pagination-next"
           :disabled="currentPage === totalPages"
           @click="changePage(currentPage + 1)"
           :class="{'disabled': currentPage === totalPages}">
          Вперед
        </a>
        <ul class="pagination-list">
          <li v-for="page in totalPages" :key="page">
            <a class="pagination-link"
               :class="{'is-current': page === currentPage}"
               @click="changePage(page)">
              {{ page }}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>


<script>
import api from '@/services/api';

export default {
  name: 'DynamicTable',
  data() {
    return {
      showForm: false,
      searchQuery: '',
      newOffer: {
        offer: '',
        geo: '', // Название страны
        countryCode: '', // Код страны
        price: null,
        discount: null,
        buttonText: '',
        description: '',
        image: ''
      },
      offers: [],
      filteredOffers: [],
      geoData: [],
      currentPage: 1,
      totalPages: 1,
      offersPerPage: 10,
      selectedCountry: '',  // Добавленное поле для выбранной страны
    };
  },
  computed: {
    // Пагинация: выбираем офферы для текущей страницы
    paginatedOffers() {
      const start = (this.currentPage - 1) * this.offersPerPage;
      const end = start + this.offersPerPage;
      return this.filteredOffers.slice(start, end);
    },

    // Вычисляемое свойство для базового URL
    apiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL; // Используем переменную окружения
    }
  },
  watch: {
    searchQuery() {
      this.filterOffers();
    },
    selectedCountry() {
      this.fetchOffers();  // Загружаем офферы при смене страны
    }
  },
  methods: {
    // Загружаем офферы для выбранной страны
    async fetchOffers() {
      try {
        const response = await api.get(`/api/offers/?country=${this.selectedCountry}`);
        this.offers = response.data.map(offer => ({
          ...offer,
          buttonText: offer.button_text,
        }));
        this.filterOffers();
      } catch (error) {
        console.error('Ошибка при загрузке офферов:', error);
        alert('Не удалось загрузить офферы. Пожалуйста, попробуйте позже.');
      }
    },

    // Загружаем данные стран (гео)
    async fetchGeoData() {
      try {
        const response = await api.get('/api/countries/');
        this.geoData = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке списка стран:', error);
        alert('Не удалось загрузить список стран. Пожалуйста, попробуйте позже.');
      }
    },

    // Фильтрация офферов по поисковому запросу
    filterOffers() {
      const query = this.searchQuery.toLowerCase();
      this.filteredOffers = this.offers.filter(offer =>
          (offer.offer && offer.offer.toLowerCase().includes(query)) ||
          (offer.geo && offer.geo.toLowerCase().includes(query))
      );
      this.totalPages = Math.ceil(this.filteredOffers.length / this.offersPerPage);
    },

    // Добавление нового оффера
    async addOffer() {
      // Проверка на обязательные поля
      if (!this.newOffer.offer || !this.newOffer.geo || this.newOffer.price == null || this.newOffer.discount == null || !this.newOffer.image) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
      }

      // Проверка на корректность URL изображения
      if (!this.isValidUrl(this.newOffer.image)) {
        alert('Пожалуйста, укажите корректный URL для изображения.');
        return;
      }

      // Отправка оффера на сервер
      try {
        const response = await api.post('/generate_offer/', this.newOffer);
        this.offers.push(response.data);
        this.filterOffers();
        this.showForm = false;
        this.cancelForm();
      } catch (error) {
        console.error('Ошибка при добавлении оффера:', error);
        alert('Не удалось добавить оффер. Пожалуйста, попробуйте позже.');
      }
    },

    // Закрытие формы добавления оффера
    cancelForm() {
      this.showForm = false;
      this.newOffer = {
        offer: '',
        geo: '',
        countryCode: '', // Очистка кода страны
        price: null,
        discount: null,
        buttonText: '',
        description: '',
        image: ''
      };
    },

    // Удаление оффера
    async deleteOffer(id) {
      try {
        await api.delete(`/api/offers/${id}/`);
        this.offers = this.offers.filter(offer => offer.id !== id);
        this.filterOffers();
      } catch (error) {
        console.error('Ошибка при удалении оффера:', error);
        alert('Не удалось удалить оффер. Пожалуйста, попробуйте позже.');
      }
    },

    // Обработчик выбора страны из выпадающего списка
    setCountryCode() {
      // Находим страну по имени и сохраняем её код
      const selectedCountry = this.geoData.find(country => country.name === this.newOffer.geo);
      if (selectedCountry) {
        this.newOffer.countryCode = selectedCountry.code;
      }
    },

    // Пагинация: смена страницы
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // Проверка на валидный URL
    isValidUrl(url) {
      const pattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
      return pattern.test(url);
    }
  },

  // При монтировании компонента, загружаем данные
  mounted() {
    this.fetchGeoData();
    this.fetchOffers();
  }
};
</script>



<style scoped>
/* Полоса на всю ширину страницы */
.full-width-bar {
  background-color: #1e1e1e; /* Темный цвет полосы */
  padding: 20px 0; /* Увеличиваем padding для увеличения высоты полосы */
  width: 100%;
}

.bar-content {
  display: flex;
  justify-content: center;
}

.bar-item {
  color: #f1f1f1;
  font-weight: bold;
  padding: 0 20px;
  text-decoration: none;
}

.bar-item:hover {
  background-color: #333;
}

/* Основной фон страницы */
body {
  background-color: #121212; /* Очень темный фон */
  font-family: 'Roboto', sans-serif; /* Приятный шрифт */
  color: #e0e0e0; /* Светлый цвет текста */
}

/* Контейнер с ограничением ширины и отступами */
.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  background-color: #1f1f1f; /* Темный фон контейнера */
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* Легкая тень для контейнера */
  margin-top: 30px; /* Добавляем отступ сверху, чтобы таблица не была в упор к полосе */
}

/* Кнопка "Добавить Оффер" такого же цвета, как и полоса сверху */
.add-offer-button {
  background-color: #1e1e1e; /* Темный цвет кнопки */
  color: #f1f1f1;
}

.add-offer-button:hover {
  background-color: #333; /* Тёмный серый при наведении */
}

/* Стили для пагинации */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-previous,
.pagination-next {
  color: #1e88e5; /* Голубой цвет кнопок по умолчанию */
}

.pagination-previous.disabled,
.pagination-next.disabled {
  color: #666; /* Тускло серый цвет, когда кнопки неактивны */
  cursor: not-allowed; /* Убираем возможность клика */
}

.pagination-previous:hover:not(.disabled),
.pagination-next:hover:not(.disabled) {
  background-color: #333; /* При наведении на активные кнопки */
}

.pagination-link {
  color: #1e88e5;
  padding: 0.5rem 1rem;
  margin: 0 3px;
  cursor: pointer;
}

.pagination-link.is-current {
  background-color: #1e88e5;
  color: white;
}

.pagination-list {
  display: flex;
}

/* Стиль для иконок */
.icon {
  font-size: 1.25rem;
}

.fas {
  color: #1e88e5;
}

.fas:hover {
  color: #039be5;
}

/* Стиль для кнопок */
.button {
  border-radius: 5px;
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
}

.button.is-primary {
  background-color: #1e88e5;
  color: white;
}

.button.is-primary:hover {
  background-color: #039be5; /* Голубой при наведении */
}

.button.is-light {
  background-color: #333;
  color: #ccc;
}

.button.is-light:hover {
  background-color: #444;
}

.button.is-danger {
  background-color: #d82615;
  color: white;
}

.button.is-danger:hover {
  background-color: #f81200;
}

.modal-content {
  width: 60%;
  max-width: 900px;
  padding: 20px;
  background-color: #212121; /* Темный фон для модального окна */
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.modal-close.is-large {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 2rem;
  color: #ccc;
}

.modal-close.is-large:hover {
  color: #fff;
}

/* Таблица */
.table {
  width: 100%;
  background-color: #181818; /* Черный фон таблицы */
  color: #e0e0e0; /* Светлый текст для таблицы */
  border-collapse: collapse; /* Убираем отступы между ячейками */
}

.table th,
.table td {
  border: 1px solid #333; /* Темные границы ячеек */
  padding: 10px;
  text-align: left;
}

.table th {
  background-color: #222; /* Темный фон для заголовков */
  font-weight: bold;
  color: #e0e0e0; /* Белый текст в заголовках */
}

.table tr:nth-child(odd) {
  background-color: #242424; /* Чередующиеся строки с темным фоном */
}

.table tr:nth-child(even) {
  background-color: #1f1f1f; /* Чередующиеся строки с чуть светлее темным фоном */
}

.table tr:hover {
  background-color: #333; /* Подсветка строки при наведении */
}

.table td a {
  color: #1e88e5; /* Голубой цвет для ссылок в таблице */
}

.table td a:hover {
  text-decoration: underline;
}

.table td .icon {
  font-size: 2.5rem; /* Увеличиваем размер иконки */
  display: flex; /* Включаем flexbox для центрирования */
  justify-content: center; /* Горизонтальное центрирование */
  align-items: center; /* Вертикальное центрирование */
  height: 100%; /* Используем всю высоту ячейки для выравнивания */
}

/* Дополнительное стилизование ссылки с иконкой для корректного центрирования */
.table td a {
  display: flex; /* Включаем flex для выравнивания иконки */
  justify-content: center;
  align-items: center;
}

/* Стили для ввода текста (поле поиска и форма добавления) */
.input {
  border-radius: 4px; /* Легкое округление */
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 1px solid #555;
  background-color: #333; /* Темный фон для полей ввода */
  color: #f1f1f1;
}

.input:focus {
  border-color: #1e88e5; /* Голубая обводка при фокусе */
  outline: none;
}

.input.is-rounded {
  border-radius: 4px; /* Легкое округление */
}

/* Стили для формы */
.form-control {
  margin-bottom: 1rem;
}

.form-control label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #f1f1f1; /* Белый текст для меток */
}

.form-control .input {
  width: 100%;
}

.open-link-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Стили для кнопки "Открыть" */
.open-link {
  background-color: #1e88e5;
  color: white;
  font-size: 0.875rem;
}

.open-link:hover {
  background-color: #039be5;
}
</style>
