<template>
  <div id="gallery" class="q-py-xl">
    <div class="q-pa-xl">
      <div class="text-white text-h3 text-center">Gallery</div>
      <div class="q-pb-md text-white text-center full-width">
        <div class="description-lead text-body1">
          Glance is highly customizable allowing for you to change almost any
          aspect of the watch.
        </div>
      </div>
      <div class="row gallery-images">
        <div
          class="col-xs-12 col-sm-4 col-md-4 q-pa-sm"
          v-for="(img, i) in galleryImgs"
          :key="i"
        >
          <q-img
            spinner-color="white"
            class="rounded-borders"
            rounded
            :src="img.url"
            :ratio="174 / 125"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "gallery",
  data() {
    return {
      galleryImgs: [
        {
          url: "./statics/gallery8.png"
        },
        {
          url: "./statics/gallery10.png"
        },
        {
          url: "./statics/gallery6.png"
        },
        {
          url: "./statics/gallery4.jpg"
        },
        {
          url: "./statics/gallery5.png"
        },
        {
          url: "./statics/gallery11.jpg"
        }
      ]
    };
  }
};
</script>

<style>
#gallery {
  background: linear-gradient(
      rgba(34, 34, 34, 0.95) 100%,
      rgba(34, 34, 34, 0.96) 100%
    ),
    url("../statics/bg2.jpg");
  background-position: bottom;
}
.gallery-images {
  max-width: 1000px;
  margin: auto;
}
</style>
