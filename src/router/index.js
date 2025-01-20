import { createRouter, createWebHistory } from 'vue-router';
import DynamicTable from '@/components/DynamicTable.vue';
import Geo from '@/components/Geo.vue';

const routes = [
    {
        path: '/offers',
        name: 'Offers',
        component: DynamicTable,
    },
    {
        path: '/geo',
        name: 'Geo',
        component: Geo,
    },
    {
        path: '/:catchAll(.*)', // Новый способ для catch-all маршрута
        redirect: '/offers',    // Редирект на offers по умолчанию
    },
];

const router = createRouter({
    history: createWebHistory(),  // Использование режима History
    routes,                      // Массив маршрутов
});

export default router;
