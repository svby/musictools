import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import Home from "../views/Home.vue";

import PlaylistShuffle from "@/views/shuffle/PlaylistShuffle.vue";
import TopArtistsChart from "@/views/chart/TopArtistsChart.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/tools/shuffle",
    name: "PlaylistShuffle",
    component: PlaylistShuffle,
  },
  {
    path: "/tools/artists",
    name: "TopArtistsChart",
    component: TopArtistsChart,
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
