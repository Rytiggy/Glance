<template>
  <div class="glance-footer q-py-xl q-px-md">
    <div class="text-white text-center full-width">
      <div class="description-lead text-body1 text-white">
        This program is free software distributed under the terms of the GNU
        General Public License as published by the Free Software Foundation,
        either version 3 of the License, or any later version. See
        http://www.gnu.org/licenses/gpl.txt for more details
        <div class="q-py-sm">
          <a
            class="text-h4 q-px-sm text-white"
            target="_blank"
            href="https://github.com/Rytiggy/Glance"
          >
            <i class="fab fa-github"></i>
          </a>
          <a
            class="text-h4 q-px-sm text-white"
            target="_blank"
            href="https://www.facebook.com/groups/Glance/"
          >
            <i class="fab fa-facebook"></i>
          </a>
          <a
            class="text-h4 q-px-sm text-white"
            target="_blank"
            href="https://discord.gg/RUa7U6F/"
          >
            <i class="fab fa-discord"></i>
          </a>
        </div>
        Made by
        <a href="http://ryanmasonjar.com" target="_blank" class="text-grey-10"
          >Ryan Mason</a
        >
        | 2019
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style>
.glance-footer {
  background: linear-gradient(
      rgba(75, 162, 220, 1.9) 100%,
      rgba(75, 162, 220, 1.9) 100%
    ),
    url("../statics/morocco.png");
  background-repeat: repeat;
}
</style>
