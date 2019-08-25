<template>
  <div>
    <q-page>
      <glanceHeader />
      <features />
      <gallery />
      <setup />
      <donations />
    </q-page>
  </div>
</template>

<style></style>

<script>
import { scroll } from "quasar";
const { getScrollTarget, setScrollPosition } = scroll;

import glanceHeader from "../components/GlanceHeader.vue";
import features from "../components/Features.vue";
import gallery from "../components/Gallery.vue";
import setup from "../components/Setup.vue";
import donations from "../components/Donations.vue";

export default {
  name: "homepage",
  components: {
    features,
    gallery,
    glanceHeader,
    donations,
    setup
  },
  data() {
    return {};
  },
  mounted: function() {
    console.log(window.location.hash.replace("#", ""));
    if (window.location.hash) {
      let el = document.getElementById(window.location.hash.replace("#", ""));
      const target = getScrollTarget(el);
      const offset = el.offsetTop;
      const duration = 500;
      setScrollPosition(target, offset, duration);
    }
  }
};
</script>
<style>
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
