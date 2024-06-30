import axios from "axios";

export default async ({ app, Vue }) => {
  app.$axios = axios
};
