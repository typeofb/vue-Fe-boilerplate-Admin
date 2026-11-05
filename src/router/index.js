import {createRouter, createWebHistory} from 'vue-router';
import routes from './routes';
import {setupGuards} from './guards';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition;
        if (to.hash) return {el: to.hash, behavior: 'smooth'};
        return {top: 0};
    },
});

setupGuards(router);

export default router;
