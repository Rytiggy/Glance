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
