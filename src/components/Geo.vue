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
      <!-- Кнопка для открытия формы добавления страны -->
      <button @click="showCountryForm = true" class="button is-medium is-fullwidth mb-5 add-offer-button">
        <span class="icon">
          <i class="fas fa-plus"></i>
        </span>
        <span>Добавить Страну</span>
      </button>

      <!-- Модальное окно для формы добавления страны -->
      <div v-if="showCountryForm" class="modal is-active">
        <div class="modal-background" @click.self="cancelCountryForm"></div>
        <div class="modal-content">
          <div class="box">
            <h2 class="subtitle has-text-centered has-text-black">Новая Страна</h2>
            <form @submit.prevent="addCountry">
              <div class="field">
                <label class="label">Код страны:</label>
                <div class="control">
                  <input v-model="newCountry.code" class="input" type="number" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Имя страны:</label>
                <div class="control">
                  <input v-model="newCountry.name" class="input" type="text" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Валюта:</label>
                <div class="control">
                  <input v-model="newCountry.currency" class="input" type="text" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Язык:</label>
                <div class="control">
                  <input v-model="newCountry.language" class="input" type="text" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Описание:</label>
                <div class="control">
                  <input v-model="newCountry.actions" class="input" type="text" required />
                </div>
              </div>
              <div class="field is-grouped is-grouped-right">
                <div class="control">
                  <button type="submit" class="button is-primary is-rounded">
                    Сохранить
                  </button>
                </div>
                <div class="control">
                  <button type="button" @click="cancelCountryForm" class="button is-light is-rounded">
                    Отмена
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <button class="modal-close is-large" aria-label="close" @click="cancelCountryForm"></button>
      </div>

      <!-- Таблица стран -->
      <table class="table is-fullwidth is-bordered is-striped is-hoverable has-background-light">
        <thead>
        <tr>
          <th>Код страны (номер)</th>
          <th>Имя</th>
          <th>Валюта</th>
          <th>Язык</th>
          <th>Описание</th>
          <th>Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(country, index) in countries" :key="country.code">
          <td>{{ country.code }}</td>
          <td>{{ country.name }}</td>
          <td>{{ country.currency }}</td>
          <td>{{ country.language }}</td>
          <td>{{ country.actions }}</td>
          <td>
            <button @click="deleteCountry(index)" class="button is-danger is-small is-rounded">
              Удалить
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; // Для работы с HTTP запросами

export default {
  name: "Geo",
  data() {
    return {
      countries: [], // Список стран
      showCountryForm: false, // Флаг для отображения формы
      newCountry: {
        code: null,
        name: '',
        currency: '',
        language: '',
        actions: '', // Описание
      },
    };
  },
  methods: {
    // Получение списка стран с сервера
    async getCountries() {
      try {
        const response = await axios.get('http://localhost:8000/api/countries/');
        this.countries = response.data;
      } catch (error) {
        console.error('Ошибка при получении стран:', error);
      }
    },

    // Добавление новой страны
    async addCountry() {
      try {
        const response = await axios.post('http://localhost:8000/api/countries/', this.newCountry);
        // Добавление страны в список
        this.countries.push(response.data);
        // Закрытие формы
        this.cancelCountryForm();
      } catch (error) {
        console.error('Ошибка при добавлении страны:', error);
      }
    },

    // Закрытие формы добавления страны
    cancelCountryForm() {
      this.showCountryForm = false;
      this.newCountry = {
        code: null,
        name: '',
        currency: '',
        language: '',
        actions: '',
      };
    },

    // Удаление страны
    async deleteCountry(index) {
      const countryCode = this.countries[index].code;
      try {
        await axios.delete(`http://localhost:8000/api/countries/${countryCode}`);
        // Удаление из списка
        this.countries.splice(index, 1);
      } catch (error) {
        console.error('Ошибка при удалении страны:', error);
      }
    }
  },
  mounted() {
    // Загружаем список стран при монтировании компонента
    this.getCountries();
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

table td {
  vertical-align: middle; /* Вертикальное выравнивание */
  text-align: center; /* Горизонтальное выравнивание */
}

</style>
