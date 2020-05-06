import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import React from "react";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#D291BC",
      contrastText: "#fff"
    },
    secondary: {
      main: "#C1E7E3"
    }
  }
});
export default function Theme(props) {
  return <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>;
}
