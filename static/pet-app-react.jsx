function PetDisplay(props) {
  // console.log(props.pet);

  return (
    <div>
      <div>
        <img src={`${props.pet.species_img_path}`} alt={`${props.pet.species_name}`} id="species-img" />
        <p>Images created using <a href="https://www.craiyon.com/">Craiyon</a></p>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Pet species</td>
            <td id="pet-species">{props.pet.species_name}</td>
          </tr>
          <tr>
              <td>Favorite food</td>
              <td id="food-fave">{props.pet.food_fave}</td>
          </tr>
          <tr>
              <td>Least favorite food</td>
              <td id="food-least">{props.pet.food_least}</td>
          </tr>
          <tr>
              <td>Favorite activity</td>
              <td id="activity-fave">{props.pet.activity_fave}</td>
          </tr>
          <tr>
              <td>Least favorite activity</td>
              <td id="activity-least">{props.pet.activity_least}</td>
          </tr>
          <tr>
              <td>Favorite music genre</td>
              <td id="music-fave">{props.pet.music_fave}</td>
          </tr>
          <tr>
              <td>Least favorite music genre</td>
              <td id="music-least">{props.pet.music_least}</td>
          </tr>
          <tr>
              <td>Favorite weather</td>
              <td id="weather-fave">{props.pet.weather_fave}</td>
          </tr>
          <tr>
              <td>Least favorite weather</td>
              <td id="weather-least">{props.pet.weather_least}</td>
          </tr>
          <tr>
              <td>Personality</td>
              <td id="personality">{props.pet.personality}</td>
          </tr>
          <tr>
              <td>Astrological sign</td>
              <td id="astro-sign">{props.pet.astro_sign}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}


function PetGenerator(props) {
  // alert("Looks like you don't have a pet yet! Let's fix that.")
  const [newPetData, setNewPetData] = React.useState();
  console.log("Loading pet generator");
  console.log(newPetData);

  function generateNewPet() {
    console.log("generating pet");
    fetch("/generate-pet")
    .then((response) => response.json())
    .then((petJson) => {
      console.log("new pet available");
      setNewPetData(petJson);
    });
  }

  function adoptPet() {
    console.log("adopting pet");
    fetch("/get-loc")
      .then((response) => response.json())
      .then((userData) => {
        console.log(userData);

        let name = prompt("Please name your pet:");
        setNewPetData((currentNewPetData) => ({
            ...currentNewPetData,
            "name": name,
            "country": userData["country"],
            "region": userData["regionName"],
            "city": userData["city"],
            "lat": userData["lat"],
            "lon": userData["lon"]
        }));

        fetch("/adopt-pet", {
          method: 'POST',
          body: JSON.stringify(newPetData),
          headers: {
              'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((msg) => {
              alert(msg);
              setHasPet("yes");
          });
    });
  }


  if (newPetData) {
    console.log("showing pet")
    return (
      <div>
        <h2>Potential Pet</h2>
        <button type="button" onClick={generateNewPet} id="generate-pet">GENERATE PET</button><br />
        <PetDisplay pet={newPetData} />
        <br/><button type="button" onClick={adoptPet} id="adopt-pet">ADOPT PET</button>
      </div>
    )
  } else {
    return (
      <div><button type="button" onClick={generateNewPet} id="generate-pet">GENERATE PET</button></div>
    )
  }
  
}


function CurrentPet(props) {
  alert("Your pet is so cute!");

  return (
    <div>
      <h1>meow! here is your pet!</h1>
      <h2>{props.pet.name} the {props.pet.personality} {props.pet.species_name}</h2>
      <h3 id="location">Location: {props.pet.city}, {props.pet.region}, {props.pet.country}</h3>
      <PetDisplay pet={props.pet} />
  
      <button id="delete-pet">DELETE PET</button>
    </div>
  )
}


function VirtualPetApp() {
  const [petData, setPetData] = React.useState();
  const [hasPet, setHasPet] = React.useState();

  console.log("Loading app")

  React.useEffect(() => {
    console.log("fetching");
    fetch("/user-info")
      .then((response) => response.json())
      .then((petJson) => {
        if (petJson) {
          console.log("has pet")
          setPetData(petJson);
          setHasPet("yes");
        } else {
          console.log("no pet");
          setHasPet("no");
        }
      })
  }, []);
  
  if (hasPet == "yes") {
    console.log("hasPet condition met")
    return (
      // <React.StrictMode>
      <CurrentPet pet={petData} />
      // </React.StrictMode>
    )
  } else if (hasPet == "no") {
    console.log("hasPet condition NOT met")
    return (
      // <React.StrictMode>
      <PetGenerator hasPet={hasPet} setHasPet={setHasPet} />
      // </React.StrictMode>
    )
  } else {
    console.log("the void")
    return (
      <div>Loading...</div>
    )
  }
}


ReactDOM.render(<VirtualPetApp />, document.querySelector("#app")); 
