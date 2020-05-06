import React from "react";
import "./App.css";
import {
  TextField,
  Grid,
  makeStyles,
  Box,
  Paper,
  Button,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import Theme from "./Theme";
import { Chance } from "chance";
import lodash from "lodash";
import { hot } from "react-hot-loader";

const useStyles = makeStyles((theme) => ({
  form: {
    maxWidth: 300,
    margin: "auto",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    // alignContent: "left",
  },
  button: {
    marginLeft: "auto",
  },
  simulator: {
    padding: 16,
    maxWidth: 800,
    overflowY: "scroll",
  },
  simulatorContainer: {
    display: "flex",
    justifyContent: "center",
    // alignItems: "center",
    height: "10a0vh",
  },
  simulatorHeader: {
    maxWidth: 760,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 16,
    marginBottom: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  box: {
    display: "flex",
    margin: 4,
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 4,
    backgroundColor: "white",
    color: "#444",
    boxShadow: "-1px 1px rgba(255,255,255, 0.2)",
    padding: 8,
  },
}));

function simulate({
  clientes,
  serviceTimeLimits,
  arrivalTimeLimits,
  cantidadCajeros,
}) {
  const chance = new Chance();
  // Creamos el array de llegadas con la primera llegada ya tipificada.
  var llegadas = [
    {
      clientName: chance.name(),
      serviceTime: chance.integer({
        min: serviceTimeLimits.min,
        max: serviceTimeLimits.max,
      }),
      arrivalTime: 0,
      timeBetweenArrival: 0,
    },
  ];

  // Generamos datos aleatorios del nombre de cliente y tiempo de llegada y servicio para el resto de llegadas
  for (let i = 1; i < clientes; i++) {
    const timeBetweenArrival = chance.integer({
      min: arrivalTimeLimits.min,
      max: arrivalTimeLimits.max,
    });
    const arrivalTime = llegadas[i - 1].arrivalTime + timeBetweenArrival;
    const serviceTime = chance.integer({
      min: serviceTimeLimits.min,
      max: serviceTimeLimits.max,
    });
    const llegada = {
      clientName: chance.name(),
      serviceTime,
      timeBetweenArrival,
      arrivalTime,
    };
    llegadas.push(llegada);
  }

  // Las ordenamos segun el tiempo de llegada
  llegadas = lodash.orderBy(llegadas, ["arrivalTime", "asc"]);

  // Asignamos el cajero a cada llegada y agregamos el tiempo en el que el servicio inicia,
  // el cajero en el que fue atendido, tiempo en el que el servicio tiermina, tiempo en cola y tiempo en el sistema
  llegadas = assignCheckers(llegadas, cantidadCajeros);

  console.log("86:", llegadas);

  return llegadas;
}

const assignCheckers = (llegadas, cantidadCajeros) => {
  var newList = llegadas;
  // Inicializamos un array de "cantidadCajeros" elementos que seran 0
  console.log("cantidadCajeros", cantidadCajeros);
  var checkers = new Array(cantidadCajeros).fill(0);
  console.log("checkers", checkers);
  // Recorremos el array de llegadas
  for (let i = 0; i < llegadas.length; i++) {
    const llegada = newList[i];
    console.log("llegada", llegada);
    // Un cajero se considerara libre si el ultimo tiempo almacenado (que equivale al ultimo tiempo en el que el cajero
    // estuvo ocupado) es menor al tiempo de llegada
    const freeCheckerIndex = checkers.findIndex(
      (value) => value < llegada.arrivalTime
    );
    console.log("freeCheckerIndex", freeCheckerIndex);

    if (freeCheckerIndex !== -1) {
      // Si hay un cajero libre lo ocupamos
      checkers[freeCheckerIndex] = llegada.serviceTime + llegada.arrivalTime;
      // El tiempo de inicio será el tiempo de llegada
      llegada.serviceBegin = llegada.arrivalTime;
      llegada.asignedChecker = freeCheckerIndex;
    } else {
      // Si ninguno esta libre ocupamos el que antes se desocupe
      const min = Math.min(...checkers);
      console.log(min);
      const nextIdleIndex = checkers.findIndex((value) => value === min);
      llegada.serviceBegin = min;
      checkers[nextIdleIndex] = llegada.serviceTime + llegada.serviceBegin;
      llegada.asignedChecker = nextIdleIndex;
    }
    llegada.serviceEnd = llegada.serviceBegin + llegada.serviceTime;
    llegada.queueTime = llegada.serviceBegin - llegada.arrivalTime;
    llegada.systemTime = llegada.serviceEnd - llegada.arrivalTime;
  }

  return newList;
};

const Simulator = ({
  cantidadCajeros,
  clientes,
  serviceTimeLimits,
  arrivalTimeLimits,
}) => {
  const [llegadas, setLlegadas] = React.useState([]);
  const classes = useStyles();

  React.useEffect(() => {
    setLlegadas(() =>
      simulate({
        clientes,
        serviceTimeLimits,
        arrivalTimeLimits,
        cantidadCajeros: parseInt(cantidadCajeros),
      })
    );
  }, [clientes, serviceTimeLimits, arrivalTimeLimits, cantidadCajeros]);

  return (
    <>
      <Grid container justify="center">
        <Typography variant="h2" color="primary">
          Simulador de cajeros
        </Typography>
        <Grid item xs={12}>
          <div className={classes.simulatorHeader}>
            <div className={classes.box}>
              <Typography variant="subtitle2" color="inherit">
                Clientes
              </Typography>
              <Typography variant="h6" color="inherit">
                {clientes}
              </Typography>
            </div>
            <div className={classes.box}>
              <Typography variant="subtitle2" color="inherit">
                Cajeros
              </Typography>
              <Typography variant="h6" color="inherit">
                {cantidadCajeros}
              </Typography>
            </div>
            <div className={classes.box}>
              <Typography variant="subtitle2" color="inherit">
                Servicios entre
              </Typography>
              <Typography variant="h6" color="inherit">
                {`${serviceTimeLimits.min} - ${serviceTimeLimits.max}`}
              </Typography>
            </div>
            <div className={classes.box}>
              <Typography variant="subtitle2" color="inherit">
                Llegadas entre
              </Typography>
              <Typography variant="h6" color="inherit">
                {`${arrivalTimeLimits.min} - ${arrivalTimeLimits.max}`}
              </Typography>
            </div>
          </div>
        </Grid>

        <Grid item xs={12} className={classes.simulator}>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Arribo</TableCell>
                  <TableCell align="center">Tiempo entre llegadas</TableCell>
                  <TableCell align="center">Tiempo de servicio</TableCell>
                  <TableCell align="center">Servicio inicia</TableCell>
                  <TableCell align="center">Servicio termina</TableCell>
                  <TableCell align="center"> Cajero </TableCell>
                  <TableCell align="center">Tiempo en cola</TableCell>
                  <TableCell align="center">Tiempo en el sistema</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {llegadas.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{row.arrivalTime}</TableCell>
                    <TableCell align="center">
                      {row.timeBetweenArrival}
                    </TableCell>
                    <TableCell align="center">{row.serviceTime}</TableCell>
                    <TableCell align="center">{row.serviceBegin}</TableCell>
                    <TableCell align="center">{row.serviceEnd}</TableCell>
                    <TableCell align="center">{row.asignedChecker}</TableCell>
                    <TableCell align="center">{row.queueTime}</TableCell>
                    <TableCell align="center">{row.systemTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={6}></Grid>
      </Grid>
    </>
  );
};

// Todo comienza aqui, esta es la UI para tomar la cantidad de cajeros, la cantidad de clientes y
// los valores limite de los tiempos entre llegada y de servicio
function App() {
  const classes = useStyles();
  const [arrivalTimeLimits, setArrivalTimeLimits] = React.useState({
    min: "",
    max: "",
  });
  const [serviceTimeLimits, setServiceTimeLimits] = React.useState({
    min: "",
    max: "",
  });
  const [cajeros, setCajeros] = React.useState("");
  const [clientes, setClientes] = React.useState("");
  const [view, setView] = React.useState("MAIN");

  return (
    <Theme>
      {view === "MAIN" && (
        <Grid container spacing={2} className={classes.form}>
          <Grid item>
            <TextField
              label="Cantidad de cajeros"
              fullWidth
              type="number"
              value={cajeros}
              onChange={(e) => setCajeros(parseInt(e.target.value))}
              variant="filled"
            />
          </Grid>
          <Grid item>
            <TextField
              label="Cantidad de clientes"
              fullWidth
              type="number"
              value={clientes}
              onChange={(e) => setClientes(parseInt(e.target.value))}
              variant="filled"
            />
          </Grid>
          <Grid item>
            <TextField
              label="Arrival time(min)"
              fullWidth
              type="number"
              value={arrivalTimeLimits.min}
              onChange={(e) =>
                setArrivalTimeLimits({
                  ...arrivalTimeLimits,
                  min: parseInt(e.target.value),
                })
              }
              variant="filled"
            />
          </Grid>
          <Grid item>
            <TextField
              label="Arrival time (max)"
              fullWidth
              type="number"
              value={arrivalTimeLimits.max}
              onChange={(e) =>
                setArrivalTimeLimits({
                  ...arrivalTimeLimits,
                  max: parseInt(e.target.value),
                })
              }
              variant="filled"
            />
          </Grid>

          <Grid item>
            <TextField
              label="Service time (min)"
              fullWidth
              type="number"
              value={serviceTimeLimits.min}
              onChange={(e) =>
                setServiceTimeLimits({
                  ...serviceTimeLimits,
                  min: parseInt(e.target.value),
                })
              }
              variant="filled"
            />
          </Grid>
          <Grid item>
            <TextField
              label="Arrival time(max)"
              fullWidth
              type="number"
              value={serviceTimeLimits.max}
              onChange={(e) =>
                setServiceTimeLimits({
                  ...serviceTimeLimits,
                  max: parseInt(e.target.value),
                })
              }
              variant="filled"
            />
          </Grid>

          <Grid item className={classes.button}>
            <Button
              onClick={() => setView("SIMULATOR")}
              variant="contained"
              color="secondary"
            >
              CONTINUAR
            </Button>
          </Grid>
        </Grid>
      )}

      {view === "SIMULATOR" && (
        <>
          <Button variant="contained" size="large" color="secondary" onClick={() => setView("MAIN")} style={{ position: "fixed", right: 32, bottom: 32 }}>
            REINICIAR
          </Button>
          <div className={classes.simulatorContainer}>
            <Simulator
              clientes={clientes}
              cantidadCajeros={cajeros}
              serviceTimeLimits={serviceTimeLimits}
              arrivalTimeLimits={arrivalTimeLimits}
            />
          </div>
        </>
      )}
    </Theme>
  );
}

export default hot(module)(App);
