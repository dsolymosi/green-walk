import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css'
import useCollapse from "react-collapsed";
import * as Ons from 'react-onsenui';





function App(){
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  useEffect(() => { navigator.geolocation.getCurrentPosition((pos) => {setLat(pos.coords.latitude); setLon(pos.coords.longitude);}) }, []);

  
  const [buttonClicked, setButtonClicked] = useState(false);

  return (
    <Ons.Page renderToolbar={() => <Ons.Toolbar><div className="left"> {buttonClicked && <Ons.BackButton onClick={() => setButtonClicked(false)}/>} </div><div className="center">Green Walk</div></Ons.Toolbar>}>
    <ParkList lat={lat} lon={lon} buttonClicked={buttonClicked} setButtonClicked={setButtonClicked}/>
    </Ons.Page>
  );
}

function ParkList(props){
  const [parks, setParks] = useState([]);

  const handleButton = () => {
    const doFetch = async () => {
      setParks([]);
      const out = await fetch("https://2gexxarapi.execute-api.ca-central-1.amazonaws.com/v1/parks?lat=" + props.lat + "&lon=" + props.lon + "&radius=1000.0");
      setParks(await out.json());
    }
    if(props.lat !== 0 && props.lon !== 0) {
      props.setButtonClicked(true);
      doFetch();
    }
  }

  return (
    <>{!props.buttonClicked && <SearchButton cb={handleButton}/>} 
    {props.buttonClicked && parks.length === 0 && <Searching/>}
    {props.buttonClicked && !Array.isArray(parks) && <div> <p>Sorry! We encountered an error. Please try again in a few seconds.</p> {parks.error && <p>{parks.error}</p>} </div>}
    {props.buttonClicked && Array.isArray(parks) && parks !== [] && <AllParks json={parks} lat={props.lat} lon={props.lon}/>}
    </>
  )
}

function SearchButton (props){
  return (
    <Ons.Button onClick={props.cb} style={{width:'100%', paddingTop:'1em', paddingBottom:'1em',}}>Find parks close to me!</Ons.Button>
  )
}

function Searching(){
  return (
    <div style={{width:'100%', textAlign:'center'}}><Ons.ProgressBar indeterminate /><p> Searching... </p></div>
  )
}

function AllParks (props){
    return (
      <table width='100%'><tbody>
        {props.json.map((k) => {return ( <ParkEntry key={k.name+k.dist} name={k.name} parkWidth={k.width} dist={k.dist} lat={k.lat} lon={k.lon} acc={k.accessible} paid={k.paid} myLat={props.lat} myLon={props.lon} /> );})}
      </tbody></table>
  )
}
function ParkEntry(props){
  //const [expanded, setExpanded] = useState(false);
  const {getCollapseProps, getToggleProps, isExpanded} = useCollapse();

  return (
    <><tr {...getToggleProps()}><td style={{paddingTop:'1em', paddingBottom:'1em', display:'flex', justifyContent:'space-between', backgroundColor:'lightgray'}}><div><b>{props.name}</b> {props.parkWidth < 50 && " (tiny park)"}{props.parkWidth >= 50 && props.parkWidth < 100 && " (small park)"}{props.acc && " ♿"}{props.paid && <i> $$$</i>} </div> <div>{props.dist}m away</div></td><td style={{backgroundColor:'grey', paddingLeft:10, paddingRight:10, textAlign:'center'}}>{isExpanded? '▲' : '▼'}</td>
    </tr>
    {isExpanded && <tr {...getCollapseProps()}><td colSpan={2}><iframe
    title={props.name}
    width='100%'
    height={window.innerHeight/3}
    style={{border: 0}}
    referrerPolicy="no-referrer-when-downgrade"
    src={'https://www.google.com/maps/embed/v1/directions?key=AIzaSyBY7nOE9IoSgNKwsr3vX4q4mpzD1d8edhE&origin=' + props.myLat + ',' + props.myLon + '&destination=' + props.myLat + ',' + props.myLon + '&waypoints=' + props.lat + ',' + props.lon + '&mode=walking'}
    allowFullScreen></iframe></td></tr>}
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
