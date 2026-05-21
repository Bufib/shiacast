import React from "react";
import { Redirect } from "expo-router";


// Redirects to the first tab. Without it the homescreen stays blank
const index = () => {
  return <Redirect href="/(tabs)/home" />;
};
export default index;
