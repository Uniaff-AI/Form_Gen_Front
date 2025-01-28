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
          <!-- УДАЛЁННЫЕ ПОЛЯ:
               Текст кнопки
               Описание
          -->
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
          <!-- Убрали колонки "Текст кнопки" и "Описание" -->
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
          <!-- Удаляем соответствующие ячейки -->
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
        geo: '',        // Название страны
        countryCode: '',// Код страны
        price: null,
        discount: null,
        // buttonText: '',   Удалено
        // description: '',  Удалено
        image: ''
      },
      offers: [],
      filteredOffers: [],
      geoData: [],
      currentPage: 1,
      totalPages: 1,
      offersPerPage: 10,
      selectedCountry: '',
      isDarkTheme: false
    };
  },
  computed: {
    paginatedOffers() {
      const start = (this.currentPage - 1) * this.offersPerPage;
      const end = start + this.offersPerPage;
      return this.filteredOffers.slice(start, end);
    },
    apiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL;
    }
  },
  watch: {
    searchQuery() {
      this.filterOffers();
    },
    selectedCountry() {
      this.fetchOffers();
    }
  },
  methods: {
    applyTheme() {
      if (this.isDarkTheme) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
    },
    handleThemeChange(event) {
      this.isDarkTheme = event.matches;
      this.applyTheme();
    },
    async fetchOffers() {
      try {
        const response = await api.get(`/api/offers/?country=${this.selectedCountry}`);
        this.offers = response.data;
        this.filterOffers();
      } catch (error) {
        console.error('Ошибка при загрузке офферов:', error);
        alert('Не удалось загрузить офферы. Пожалуйста, попробуйте позже.');
      }
    },
    async fetchGeoData() {
      try {
        const response = await api.get('/api/countries/');
        this.geoData = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке списка стран:', error);
        alert('Не удалось загрузить список стран. Пожалуйста, попробуйте позже.');
      }
    },
    filterOffers() {
      const query = this.searchQuery.toLowerCase();
      this.filteredOffers = this.offers.filter(offer =>
          (offer.offer && offer.offer.toLowerCase().includes(query)) ||
          (offer.geo && offer.geo.toLowerCase().includes(query))
      );
      this.totalPages = Math.ceil(this.filteredOffers.length / this.offersPerPage);
    },
    async addOffer() {
      if (!this.newOffer.offer || !this.newOffer.geo || this.newOffer.price == null || this.newOffer.discount == null || !this.newOffer.image) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
      }
      if (!this.isValidUrl(this.newOffer.image)) {
        alert('Пожалуйста, укажите корректный URL для изображения.');
        return;
      }
      try {
        const response = await api.post('/generate_offer/', this.newOffer);
        // После добавления оффера можно либо заново загрузить список офферов, либо
        // просто "добавить" в текущий массив. Ниже вариант подгрузки заново:
        this.fetchOffers();
        this.showForm = false;
        this.cancelForm();
      } catch (error) {
        console.error('Ошибка при добавлении оффера:', error);
        alert('Не удалось добавить оффер. Пожалуйста, попробуйте позже.');
      }
    },
    cancelForm() {
      this.showForm = false;
      this.newOffer = {
        offer: '',
        geo: '',
        countryCode: '',
        price: null,
        discount: null,
        image: ''
      };
    },
    async deleteOffer(id) {
      try {
        await api.delete(`/api/offers/${id}`);
        this.offers = this.offers.filter(offer => offer.id !== id);
        this.filterOffers();
      } catch (error) {
        console.error('Ошибка при удалении оффера:', error);
        alert('Не удалось удалить оффер. Пожалуйста, попробуйте позже.');
      }
    },
    setCountryCode() {
      const selectedCountry = this.geoData.find(country => country.name === this.newOffer.geo);
      if (selectedCountry) {
        this.newOffer.countryCode = selectedCountry.code;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    isValidUrl(url) {
      const pattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
      return pattern.test(url);
    }
  },
  mounted() {
    this.fetchGeoData();
    this.fetchOffers();
    this.isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.handleThemeChange);
  }
};
</script>





<style scoped>
/* Темная тема */
.dark-theme {
  background-color: #121212; /* Очень темный фон */
  color: #e0e0e0; /* Светлый цвет текста */
}

.dark-theme .full-width-bar {
  background-color: #1e1e1e; /* Темный цвет полосы */
}

.dark-theme .container {
  background-color: #1f1f1f; /* Темный фон контейнера */
}

.dark-theme .add-offer-button {
  background-color: #1e1e1e; /* Темный цвет кнопки */
  color: #f1f1f1;
}

.dark-theme .pagination-previous,
.dark-theme .pagination-next {
  color: #1e88e5; /* Голубой цвет кнопок */
}

.dark-theme .pagination-link {
  color: #1e88e5;
}

.dark-theme .button.is-primary {
  background-color: #1e88e5;
  color: white;
}

.dark-theme .button.is-light {
  background-color: #333;
  color: #ccc;
}

.dark-theme .table {
  background-color: #181818; /* Черный фон таблицы */
  color: #e0e0e0; /* Светлый текст */
}

.dark-theme .table th,
.dark-theme .table td {
  border: 1px solid #333; /* Темные границы */
}

.dark-theme .table tr:nth-child(odd) {
  background-color: #242424; /* Чередующиеся строки */
}

.dark-theme .table tr:nth-child(even) {
  background-color: #1f1f1f; /* Чередующиеся строки */
}

.dark-theme .input {
  background-color: #333;
  color: #f1f1f1;
}

.dark-theme .input:focus {
  border-color: #1e88e5;
}

/* Светлая тема */
.light-theme {
  background-color: #f4f4f4; /* Светлый фон */
  color: #333; /* Тёмный текст */
}

.light-theme .full-width-bar {
  background-color: #fff; /* Белая полоса */
}

.light-theme .container {
  background-color: #fff; /* Белый фон контейнера */
}

.light-theme .add-offer-button {
  background-color: #e0e0e0; /* Светлая кнопка */
  color: #333;
}

.light-theme .add-offer-button:hover {
  background-color: #d0d0d0; /* Светлый серый при наведении */
}

.light-theme .pagination-previous,
.light-theme .pagination-next {
  color: #333;
}

.light-theme .pagination-link {
  color: #1e88e5;
}

.light-theme .pagination-link.is-current {
  background-color: #1e88e5;
  color: white;
}

.light-theme .button.is-primary {
  background-color: #1e88e5;
  color: white;
}

.light-theme .button.is-light {
  background-color: #fff;
  color: #333;
}

.light-theme .table {
  background-color: #fff; /* Белый фон таблицы */
  color: #333; /* Тёмный текст */
}

.light-theme .table th,
.light-theme .table td {
  border: 1px solid #ddd; /* Светлые границы */
}

.light-theme .table tr:nth-child(odd) {
  background-color: #f9f9f9; /* Чередующиеся строки */
}

.light-theme .table tr:nth-child(even) {
  background-color: #f4f4f4; /* Чередующиеся строки */
}

.light-theme .input {
  background-color: #fff;
  color: #333;
}

.light-theme .input:focus {
  border-color: #1e88e5;
}

/* Модальное окно */
.light-theme .modal-content {
  background-color: #ffffff; /* Белый фон модального окна */
  color: #333; /* Темный текст в светлой теме */
}

.light-theme .modal-close.is-large {
  color: #333; /* Цвет крестика для закрытия */
}

.light-theme .modal-close.is-large:hover {
  color: #1e88e5; /* Голубой цвет при наведении на крестик */
}

/* Полоса на всю ширину страницы */
.full-width-bar {
  padding: 20px 0;
  width: 100%;
}

.bar-content {
  display: flex;
  justify-content: center;
}

.bar-item {
  font-weight: bold;
  padding: 0 20px;
  text-decoration: none;
}

.bar-item:hover {
  background-color: #333;
}

/* Кнопка "Добавить Оффер" */
.add-offer-button {
  color: #f1f1f1;
}

.add-offer-button:hover {
  background-color: #333;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-previous,
.pagination-next {
  color: #1e88e5;
}

.pagination-previous.disabled,
.pagination-next.disabled {
  color: #666;
  cursor: not-allowed;
}

.pagination-previous:hover:not(.disabled),
.pagination-next:hover:not(.disabled) {
  background-color: #333;
}

.pagination-link {
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
  background-color: #039be5;
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
  background-color: #212121;
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
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 10px;
  text-align: left;
}

.table th {
  font-weight: bold;
}

.table td a {
  color: #1e88e5;
}

.table td a:hover {
  text-decoration: underline;
}

.table td .icon {
  font-size: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.table td a {
  display: flex;
  justify-content: center;
  align-items: center;
}

.input {
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 1px solid #555;
}

.input:focus {
  border-color: #1e88e5;
  outline: none;
}

.input.is-rounded {
  border-radius: 4px;
}

.form-control {
  margin-bottom: 1rem;
}

.form-control label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.open-link-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.open-link {
  background-color: #1e88e5;
  color: white;
  font-size: 0.875rem;
}

.open-link:hover {
  background-color: #039be5;
}
</style>
