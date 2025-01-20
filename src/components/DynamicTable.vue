<template>
  <div>
    <!-- Полоса с кнопками на всю ширину страницы -->
    <div class="full-width-bar">
      <div class="bar-content">
        <router-link to="/geo" class="bar-item">GEO</router-link>
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
        <div class="modal-background"></div>
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
                <select v-model="newOffer.geo">
                  <option value="">Выберите страну</option>
                  <option v-for="geo in geoData" :key="geo.id" :value="geo.name">
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
          <td>{{ offer.buttonText ? offer.buttonText : 'Нет текста' }}</td>
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
              <a :href="`http://localhost:8000/static/offers/offer_${offer.id}.html`" target="_blank">
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
           @click="currentPage > 1 && currentPage--"
           :class="{'disabled': currentPage === 1}">
          Назад
        </a>
        <a class="pagination-next"
           :disabled="currentPage === totalPages"
           @click="currentPage < totalPages && currentPage++"
           :class="{'disabled': currentPage === totalPages}">
          Вперед
        </a>
        <ul class="pagination-list">
          <li v-for="page in totalPages" :key="page">
            <a class="pagination-link"
               :class="{'is-current': page === currentPage}"
               @click="currentPage = page">
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
      showForm: false, // Флаг для отображения формы добавления оффера
      searchQuery: '', // Текст поиска
      newOffer: {
        offer: '',
        geo: '', // Выбранная страна
        price: null,
        discount: null,
        buttonText: '',
        description: '',
        image: ''
      },
      offers: [], // Все офферы
      filteredOffers: [], // Офферы после фильтрации
      geoData: [], // Список стран
      currentPage: 1, // Текущая страница для пагинации
      totalPages: 1, // Количество страниц для пагинации
      offersPerPage: 10 // Количество офферов на странице
    };
  },
  computed: {
    // Вычисляем пагинированные офферы
    paginatedOffers() {
      const start = (this.currentPage - 1) * this.offersPerPage;
      const end = start + this.offersPerPage;
      return this.filteredOffers.slice(start, end);
    }
  },
  watch: {
    // Наблюдаем за изменением searchQuery для автоматической фильтрации
    searchQuery() {
      this.filterOffers();
    }
  },
  methods: {
    // Метод для загрузки всех офферов
    async fetchOffers() {
      try {
        const response = await api.get('/api/offers/');
        this.offers = response.data.map(offer => ({
          ...offer,
          buttonText: offer.button_text,  // Преобразуем данные с бэка
        }));
        this.filterOffers(); // Применяем фильтрацию
      } catch (error) {
        console.error('Ошибка при загрузке офферов:', error);
        alert('Не удалось загрузить офферы. Пожалуйста, попробуйте позже.');
      }
    },

    // Запрос на получение данных Geo (список стран)
    async fetchGeoData() {
      try {
        const response = await api.get('/api/countries/');
        this.geoData = response.data; // Сохраняем список стран в geoData
      } catch (error) {
        console.error('Ошибка при загрузке списка стран:', error);
        alert('Не удалось загрузить список стран. Пожалуйста, попробуйте позже.');
      }
    },

    // Метод для фильтрации офферов по поисковому запросу
    filterOffers() {
      const query = this.searchQuery.toLowerCase(); // Приводим запрос к нижнему регистру

      if (query === '') {
        this.filteredOffers = [...this.offers]; // Если запрос пустой, показываем все офферы
      } else {
        // Фильтруем офферы по названию, гео, тексту кнопки или описанию
        this.filteredOffers = this.offers.filter(offer =>
            (offer.offer && offer.offer.toLowerCase().includes(query)) ||
            (offer.geo && offer.geo.toLowerCase().includes(query)) ||
            (offer.buttonText && offer.buttonText.toLowerCase().includes(query)) ||
            (offer.description && offer.description.toLowerCase().includes(query))
        );
      }

      this.updatePagination(); // Обновляем пагинацию
      this.currentPage = 1; // Сбрасываем на первую страницу
    },

    // Метод для обновления количества страниц в пагинации
    updatePagination() {
      this.totalPages = Math.ceil(this.filteredOffers.length / this.offersPerPage);
    },

    // Метод для добавления нового оффера
    async addOffer() {
      if (!this.newOffer.offer || !this.newOffer.geo || !this.newOffer.price) {
        alert('Пожалуйста, заполните обязательные поля.');
        return;
      }

      try {
        const response = await api.post('/generate_offer/', this.newOffer); // Изменено на правильный путь
        this.offers.push(response.data);
        this.newOffer = { offer: '', geo: '', price: null, discount: null, buttonText: '', description: '', image: ''}; // Очистка формы
        this.showForm = false;
        this.filterOffers(); // Перезагружаем фильтрацию и пагинацию
        alert('Оффер успешно добавлен!');
      } catch (error) {
        console.error('Ошибка при добавлении оффера:', error);
        alert('Не удалось добавить оффер. Пожалуйста, попробуйте позже.');
      }
    },

    // Метод для отмены добавления оффера
    cancelForm() {
      this.showForm = false;
      this.newOffer = { offer: '', geo: '', price: null, discount: null, buttonText: '', description: '', image: '' }; // Сброс формы
    },

    // Метод для удаления оффера
    async deleteOffer(id) {
      const confirmDelete = confirm('Вы уверены, что хотите удалить этот оффер?');
      if (!confirmDelete) return;

      try {
        await api.delete(`/api/offers/${id}`);
        this.offers = this.offers.filter(offer => offer.id !== id);
        this.filterOffers(); // Перезапускаем фильтрацию и пагинацию
        alert('Оффер удален.');
      } catch (error) {
        console.error('Ошибка при удалении оффера:', error);
        alert('Не удалось удалить оффер. Пожалуйста, попробуйте позже.');
      }
    },

    // Метод для изменения страницы
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    }
  },

  mounted() {
    this.fetchOffers(); // Загружаем офферы при монтировании компонента
    this.fetchGeoData(); // Загружаем список стран при монтировании компонента
  }
};
</script>


<style scoped>
/* Полоса на всю ширину страницы */
.full-width-bar {
  background-color: #1a73e8; /* Голубой цвет полосы */
  padding: 20px 0; /* Увеличиваем padding для увеличения высоты полосы */
  width: 100%;
}

.bar-content {
  display: flex;
  justify-content: center;
}

.bar-item {
  color: white;
  font-weight: bold;
  padding: 0 20px;
  text-decoration: none;
}

.bar-item:hover {
  background-color: #0059b3;
}

/* Основной фон страницы */
body {
  background-color: #f9fafb; /* Светлый фон для всей страницы */
  font-family: 'Roboto', sans-serif; /* Приятный шрифт */
}

/* Контейнер с ограничением ширины и отступами */
.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Легкая тень для контейнера */
  margin-top: 30px; /* Добавляем отступ сверху, чтобы таблица не была в упор к полосе */
}

/* Кнопка "Добавить Оффер" такого же цвета, как и полоса сверху */
.add-offer-button {
  background-color: #1a73e8; /* Цвет полосы сверху */
  color: white;
}

.add-offer-button:hover {
  background-color: #0059b3; /* Тёмный голубой при наведении */
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
  color: #1a73e8; /* Цвет кнопок по умолчанию */
}

.pagination-previous.disabled,
.pagination-next.disabled {
  color: #a0c1e3; /* Тускло голубой цвет, когда кнопки неактивны */
  cursor: not-allowed; /* Убираем возможность клика */
}

.pagination-previous:hover:not(.disabled),
.pagination-next:hover:not(.disabled) {
  background-color: #f1f1f1; /* При наведении на активные кнопки */
}

.pagination-link {
  color: #1a73e8;
  padding: 0.5rem 1rem;
  margin: 0 3px;
  cursor: pointer;
}

.pagination-link.is-current {
  background-color: #1a73e8;
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
  color: #1a73e8;
}

.fas:hover {
  color: #0059b3;
}

/* Стиль для кнопок */
.button {
  border-radius: 5px;
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
}

.button.is-primary {
  background-color: #1a73e8;
  color: white;
}

.button.is-primary:hover {
  background-color: #0059b3; /* Тёмный голубой при наведении */
}

.button.is-light {
  background-color: #f5f5f5;
  color: #333;
}

.button.is-light:hover {
  background-color: #e0e0e0;
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
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.modal-close.is-large {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 2rem;
  color: #ccc;
}

.modal-close.is-large:hover {
  color: #333;
}

.table a {
  color: #1a73e8; /* Голубой цвет ссылок */
}

.table a:hover {
  text-decoration: underline;
}

/* Стиль для иконок изображения */
.table td a .icon {
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
  border: 1px solid #ddd;
  background-color: #f9fafb;
}

.input:focus {
  border-color: #1a73e8; /* Голубая обводка при фокусе */
  outline: none;
}

.input.is-rounded {
  border-radius: 4px; /* Легкое округление, а не сильное */
}

/* Стили для формы */
.form-control {
  margin-bottom: 1rem;
}

.form-control label {
  font-weight: bold;
  margin-bottom: 0.5rem;
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
  background-color: #1a73e8;
  color: white;
  font-size: 0.875rem;
}

.open-link:hover {
  background-color: #0059b3;
}


</style>
