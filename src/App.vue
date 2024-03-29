<template>
  <div id="scroll-container">
    <div id="page-container">
      <header>
        <h1>musictools</h1>
        <section id="navbar">
          <nav>
            <router-link to="/">Tools</router-link>
            <router-link to="/about">About</router-link>
          </nav>

          <nav id="user-container">
            <!--            <template v-if="isSignedIn">-->
            <!--              <div class="user-info">-->
            <!--                <img class="avatar" :src="spotifyCurrentUser?.images[0]?.url" alt="" />-->
            <!--                <div class="username">-->
            <!--                  Signed in as <b>{{ spotifyCurrentUser?.display_name }}</b>-->
            <!--                </div>-->
            <!--              </div>-->
            <!--            </template>-->
            <!--            <div class="sign-in" @click="spotifyLogin" v-else>Click to sign in</div>-->
            <ul>
              <li class="menu">
                <div class="menu-head">
                  <template v-if="authenticatedServices.length !== 0">
                    Signed in to {{ authenticatedServices.join(", ") }}
                  </template>
                  <template v-else>Not signed in</template>
                </div>
                <div class="menu-content">
                  <ul>
                    <li>
                      <div class="menu-head">
                        <template v-if="spotifyCurrentUser">
                          Signed in to Spotify as {{ spotifyUsername }}
                          <span class="sign-in" @click="spotifyLogout">(sign out)</span>
                        </template>
                        <template v-else>
                          <span class="sign-in" @click="spotifyLogin">Sign in to Spotify</span>
                        </template>
                      </div>
                      <div class="menu-head">
                        <template v-if="lastfmCurrentUser">
                          Last.fm user: {{ lastfmCurrentUser }}
                          <span class="sign-in" @click="lastfmLogin">(change)</span>
                        </template>
                        <template v-else>
                          <span class="sign-in" @click="lastfmLogin">Set Last.fm username</span>
                        </template>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>
        </section>
        <hr />
      </header>

      <OctocatCorner />
      <router-view />

      <footer>
        <p>
          Made with <a href="https://v3.vuejs.org/">Vue 3</a>. Available under the
          <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU General Public License</a>.
        </p>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, provide, ref, shallowRef, watch } from "vue";
  import { useStore } from "vuex";

  import { SpotifyWebApi } from "spotify-web-api-ts";
  import { PrivateUser } from "spotify-web-api-ts/types/types/SpotifyObjects";

  import LastFm from "@toplast/lastfm";

  import OctocatCorner from "@/components/OctocatCorner.vue";

  import { LastfmApiKey, SpotifyApiKey, SpotifyCurrentUserKey } from "@/data/injections";

  export default defineComponent({
    components: { OctocatCorner },

    setup() {
      const store = useStore();

      // SPOTIFY AUTH

      // TODO: make this a build environment variable
      const spotifyClientId = "6bebebaf68e407eab01ea7ca182a81a";

      const spotifyToken = computed(() => store.state.spotifyAccessToken);

      onMounted(() => store.dispatch("loadStoredState"));

      const spotifyApi = shallowRef(new SpotifyWebApi({ clientId: spotifyClientId }));
      const spotifyCurrentUser = ref<PrivateUser | null>(null);

      const fetchSpotifyState = (api: SpotifyWebApi) => {
        api.users
          .getMe()
          .then((user) => (spotifyCurrentUser.value = user))
          .catch((e) => {
            store.commit("setSpotifyToken", null);
            spotifyCurrentUser.value = null;
            console.error(e);
          });
      };

      // TODO: put state in Vuex store, should remove the need for this
      // fetchState(spotifyApi.value);

      watch(spotifyToken, (newValue) => {
        console.log("token changed to", newValue);

        if (newValue) {
          const api = new SpotifyWebApi({
            clientId: spotifyClientId,
            accessToken: newValue,
          });

          fetchSpotifyState(api);

          spotifyApi.value = api;
        } else {
          spotifyApi.value = new SpotifyWebApi({ clientId: spotifyClientId });
          spotifyCurrentUser.value = null;
        }
      });

      provide(SpotifyApiKey, spotifyApi);
      provide(SpotifyCurrentUserKey, spotifyCurrentUser);

      // LAST.FM "AUTH"

      const lastfmClientId =
        process.env.NODE_ENV === "production" ? "0300c01497ac7540c65f931b3baf50c9" : "f5b90182eeaa4dafa6ed6293327fe3d2";

      const lastfmApi = shallowRef(new LastFm(lastfmClientId));

      // TODO: last.fm "auth"
      const lastfmCurrentUser = computed(() => store.state.lastfmUsername);

      provide(LastfmApiKey, lastfmApi);

      return {
        authenticatedServices: computed(() => {
          const services = [];

          if (spotifyCurrentUser.value) services.push("Spotify");
          if (lastfmCurrentUser.value) services.push("Last.fm");

          return services;
        }),

        spotifyLogin: () => store.dispatch("getNewSpotifyToken"),
        spotifyLogout: () => store.commit("setSpotifyToken", null),
        spotifyCurrentUser,
        spotifyUsername: computed(() => spotifyCurrentUser.value?.display_name),

        // TODO: last.fm login
        lastfmLogin: () => {
          const username = prompt("Enter Last.fm username:");
          if (username != null) store.commit("setLastfmUsername", username);
        },
        lastfmCurrentUser,
      };
    },
  });
</script>

<style lang="stylus">
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&display=swap');

  html, body
    margin 0
    padding 0

  html
    /* https://uigradients.com/#eXpresso */
    background -webkit-linear-gradient(to bottom, #ad5389, #3c1053) /* Chrome 10-25, Safari 5.1-6 */
    background linear-gradient(to bottom, #ad5389, #3c1053)

    background linear-gradient(135deg, #ad5389, #3c1053)
    background-size 400% 400%

    animation backgroundGradient 30s ease infinite

    background-color #663399

    margin 0
    height 100vh

  #app
    font-family 'Open Sans', sans-serif
    -webkit-font-smoothing antialiased
    -moz-osx-font-smoothing grayscale

    color white

  #scroll-container
    height 100vh
    overflow-y auto

  #page-container
    max-width 800px
    margin 40px auto
    background-color rgba(0, 0, 0, 0.3)
    padding 40px
    box-sizing border-box

    @media screen and (max-width: 600px)
      margin 0 auto

  h1
    margin 0

  #navbar
    display flex
    flex-direction row
    row-gap 10px
    flex-wrap wrap
    justify-content space-between
    align-items center

    nav
      display flex
      flex-direction row
      column-gap 1em

      a
        font-weight 600
        cursor pointer

    nav:last-child
      ul
        margin 0
        padding 0
        list-style none

      li
        background-color rgba(0, 0, 0, 0.6)
        min-width 240px

        & > a, & > .menu-head
          cursor pointer
          padding 8px 14px

      & .menu *
        text-align right

      & > ul
        display flex
        flex-direction row

      .menu-content
        padding-top 5px
        position absolute
        display none
        width 100%

      & > ul > li
        position relative

        ul
          width 100%

          li
            width 100%
            background-color black

      & > ul > li:hover .menu-content
        display block

  .sign-in
    text-decoration underline
    cursor pointer
    font-weight bold

  hr
    margin 20px 0
    border none
    border-top 1px solid white

  a
    color inherit

  div p
    &:first-child
      margin 0

    &:last-child
      margin-bottom 0

    & + p
      margin-top 1em

  button
    padding 10px
    border none
    border-radius 4px
    cursor pointer

    background-color white
    color black

    font-size inherit
    font-weight bold

  footer
    text-align center
    font-size 8pt
    color lightgray
    margin-top 50px

    p
      margin 0 !important

    a
      color inherit

  #user-container
    min-width 0

  .user-info
    user-select none
    background-color #101010

    padding 0.25em
    padding-right calc(0.25em + 0.5em)

    height 2.5em
    box-sizing border-box
    border-radius 1.25em

    display flex
    flex-direction row
    align-items center

    max-width 400px

    .avatar
      width 2em
      height 2em
      object-fit cover

      border-radius 50%
      border 1px solid black
      box-sizing border-box
      margin-right 0.5em

    .username
      margin-right 0.5em

      text-overflow ellipsis
      overflow hidden
      white-space nowrap

  .warn
    background-color rgba(255, 255, 0, 0.3)
    padding 10px

  @keyframes backgroundGradient
    0%
      background-position: 0 50%

    50%
      background-position: 100% 50%

    100%
      background-position: 0 50%
</style>
