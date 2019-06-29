<template>
  <q-layout view="lHh Lpr lFf">
    <!-- <q-header class="glance-navebar"> -->
    <div class="fixed-top z-top">
      <div class="q-py-sm">
        <a
          class="text-h5 q-px-sm text-grey-4"
          target="_blank"
          href="https://github.com/Rytiggy/Glance"
        >
          <i class="fab fa-github"></i>
        </a>
        <a
          class="text-h5 q-px-sm text-grey-4"
          target="_blank"
          href="https://www.facebook.com/groups/Glance/"
        >
          <i class="fab fa-facebook"></i>
        </a>
        <a
          class="text-h5 q-px-sm text-grey-4"
          target="_blank"
          href="https://discord.gg/RUa7U6F/"
        >
          <i class="fab fa-discord"></i>
        </a>
      </div>
    </div>
    <!-- </q-header> -->
    <!-- <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <q-list>
        <q-item-label header>Essential Links</q-item-label>
        <q-item clickable tag="a" target="_blank" href="https://quasar.dev">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Docs</q-item-label>
            <q-item-label caption>quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://github.com/quasarframework/"
        >
          <q-item-section avatar>
            <q-icon name="code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Github</q-item-label>
            <q-item-label caption>github.com/quasarframework</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://chat.quasar.dev"
        >
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Discord Chat Channel</q-item-label>
            <q-item-label caption>chat.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://forum.quasar.dev"
        >
          <q-item-section avatar>
            <q-icon name="record_voice_over" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Forum</q-item-label>
            <q-item-label caption>forum.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://twitter.com/quasarframework"
        >
          <q-item-section avatar>
            <q-icon name="rss_feed" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Twitter</q-item-label>
            <q-item-label caption>@quasarframework</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>-->

    <q-page-container>
      <router-view />
    </q-page-container>
    <glanceFooter />
  </q-layout>
</template>

<script>
import { openURL } from "quasar";
import glanceFooter from "../components/GlanceFooter.vue";

export default {
  name: "MyLayout",
  components: {
    glanceFooter,
  },
  data() {
    return {
      leftDrawerOpen: false,
      slide: 1
    };
  },
  methods: {
    openURL
  }
};
</script>

<style>
body {
  min-width: 320px;
}
.description-lead {
  max-width: 600px;
  margin: auto;
}
</style>
