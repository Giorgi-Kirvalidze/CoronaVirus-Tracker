import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card, CardContent
} from '@material-ui/core'
import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table'
import numeral from 'numeral'
import { sortData, prettyPrintStat } from './util'
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css"
import './App.css';



function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState('cases')


  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data)
      })
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country, //Unites state,United Kingdom
            value: country.countryInfo.iso2 //UK,USA
          }));
          const sortedData = sortData(data)
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
        });
    };
    getCountriesData();
  }, []); // []it runs only once . so useeffect runs piece of code based on a given condition
  //[countries] it will run one time and everytime country variables change
  //https://disease.sh/v3/covid-19/countries

  const onCountryChange = (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode)
        setCountryInfo(data);

        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setMapZoom(4)
      })
    //https://disease.sh/v3/covid-19/countries[country-code]
    //https://disease.sh/v3/covid-19/all  
  }
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>covid 19 tracker</h1>
          <FormControl className="app_dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              {/*loop through all the countries and show dropdown options*/}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}

              {/* <MenuItem value="worldwide">0</MenuItem>
            <MenuItem value="worldwide">1</MenuItem>
            <MenuItem value="worldwide">2</MenuItem>
            <MenuItem value="worldwide">3</MenuItem> */}
            </Select>
          </FormControl>
        </div>

        {/*Header */}
        {/*Title + Dropdown*/}

        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox active={casesType === 'recovered'}
            onClick={e => setCasesType('recovered')} title="Recovered" total={prettyPrintStat(countryInfo.recovered)} cases={prettyPrintStat(countryInfo.todayRecovered)} />
          <InfoBox active={casesType === 'deaths'}
            onClick={e => setCasesType('deaths')} title="Deaths" total={prettyPrintStat(countryInfo.deaths)} cases={prettyPrintStat(countryInfo.todayDeaths)} />
          {/* infoBoxes title="coronavarius cases"*/}
          {/* infoBoxes title="coronavirus cases" */}
          {/* infoBoxes */}
        </div>
        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>
      <Card className="app__right">
        <CardContent>
          {/* Table */}
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          {/* Graph */}
          <h3 className="app__graphTitle"> Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div >
  );
}

export default App;
