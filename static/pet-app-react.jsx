function PetDisplay(props) {
  const pet = props.pet;

  return (
    <div id="pet-display">
      <div>
        <img src={`${pet.species_img_path}`} alt={`${pet.species_name}`} id="species-img" />
        <p>Images created using <a href="https://www.craiyon.com/">Craiyon</a></p>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Pet species</td>
            <td id="pet-species">{pet.species_name}</td>
          </tr>
          <tr>
              <td>Favorite food</td>
              <td id="food-fave">{pet.food_fave}</td>
          </tr>
          <tr>
              <td>Least favorite food</td>
              <td id="food-least">{pet.food_least}</td>
          </tr>
          <tr>
              <td>Favorite activity</td>
              <td id="activity-fave">{pet.activity_fave}</td>
          </tr>
          <tr>
              <td>Least favorite activity</td>
              <td id="activity-least">{pet.activity_least}</td>
          </tr>
          <tr>
              <td>Favorite music genre</td>
              <td id="music-fave">{pet.music_fave}</td>
          </tr>
          <tr>
              <td>Least favorite music genre</td>
              <td id="music-least">{pet.music_least}</td>
          </tr>
          <tr>
              <td>Favorite weather</td>
              <td id="weather-fave">{pet.weather_fave}</td>
          </tr>
          <tr>
              <td>Least favorite weather</td>
              <td id="weather-least">{pet.weather_least}</td>
          </tr>
          <tr>
              <td>Personality</td>
              <td id="personality">{pet.personality}</td>
          </tr>
          <tr>
              <td>Astrological sign</td>
              <td id="astro-sign">{pet.astro_sign}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}


function PetGeneratorIntro() {
  return (
    <React.Fragment>
      <h1>Adopt a Pet</h1>
      <p>Adopt a pet to call your own! Just click the "GENERATE PET" button until you find a pet that you like. Once you're ready, go ahead and adopt them!</p>
    </React.Fragment>
  )
}

function PetGenerator(props) {
  // Store data for generated pets in newPetData state
  const [newPetData, setNewPetData] = React.useState();
  console.log("Loading pet generator");
  console.log(newPetData);

  // Generate random pet
  function generateNewPet() {
    console.log("generating pet");
    fetch("/generate-pet")
    .then((response) => response.json())
    .then((petJson) => {
      console.log("new pet available");
      setNewPetData(petJson);
    });
  }

  // Adopt pet
  function adoptPet() {
    console.log("preparing to adopt pet");
    // Get user's location via IP address and use for pet's location
    fetch("/get-loc-mock")
      .then((response) => response.json())
      .then((userData) => {
        console.log(userData);

        let name = prompt("Please name your pet:");
        let updatedPetData = newPetData;
        updatedPetData["name"] = name;
        updatedPetData["country"] = userData["country"];
        updatedPetData["region"] = userData["regionName"];
        updatedPetData["city"] = userData["city"];
        updatedPetData["lat"] = userData["lat"];
        updatedPetData["lon"] = userData["lon"];
        setNewPetData(updatedPetData);
        console.log(newPetData);
        // setNewPetData((currentNewPetData) => {({
        //     ...currentNewPetData,
        //     "name": name,
        //     "country": userData["country"],
        //     "region": userData["regionName"],
        //     "city": userData["city"],
        //     "lat": userData["lat"],
        //     "lon": userData["lon"]
        // })}
        // );

        // Adopt pet (create pet in database and link to user)
        fetch("/adopt-pet", {
          method: 'POST',
          body: JSON.stringify(newPetData),
          headers: {
              'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((responseJson) => {
            console.log("adoption complete");
            props.setPetState({isPetAvailable: true, petData: responseJson})
            // alert(msg);
            // Promps re-render of VirtualPetApp
            // props.setPetState({...props.petState, isPetAvailable: true});
          });
    });
  }


  if (newPetData) {
    console.log("showing pet")
    return (
      <div>
        <PetGeneratorIntro />
        <h2>Potential Pet</h2>
        <button type="button" onClick={generateNewPet} id="generate-pet">GENERATE PET</button><br />
        <PetDisplay pet={newPetData} />
        <br/><button type="button" onClick={adoptPet} id="adopt-pet">ADOPT PET</button>
      </div>
    )
  } else {
    return (
      <React.Fragment>
        <PetGeneratorIntro />
        <div><button type="button" onClick={generateNewPet} id="generate-pet">GENERATE PET</button></div>
      </React.Fragment>
    )
  }
  
}


function CurrentPet(props) {
  function deletePet() {
    if (confirm("Are you sure you want to delete your pet? This action is irreversible.")) {
      fetch("/delete-pet")
        .then((response) => response.json())
        .then((msg) => {
          alert(msg);
          props.setPetState({isPetAvailable: false, petData: null});
        });
    } else {
      alert("Your pet has not been deleted.");
    }

  }

  return (
    <div>
      <h1>Your Pet</h1>
      <h2>{props.pet.name} the {props.pet.personality} {props.pet.species_name}</h2>
      <h3 id="location">Location: {props.pet.city}, {props.pet.region}, {props.pet.country}</h3>
      <PetDisplay pet={props.pet} />
  
      <button id="delete-pet" onClick={deletePet}>DELETE PET</button>
    </div>
  )
}


function VirtualPetApp() {
  // const [petData, setPetData] = React.useState(undefined);
  // // Use adoptedPet to trigger useEffect
  // const [adoptedPet, setAdoptedPet] = React.useState(false);

  const [petState, setPetState] = React.useState({isPetAvailable: false, petData: undefined})

  console.log("Loading app")

  // Check if user has existing pet
  React.useEffect(() => {
    console.log("fetching");
    fetch("/user-info")
      .then((response) => response.json())
      .then((petJson) => {
        if (petJson) {
          console.log("checked db: has pet")
          // setPetData(petJson);
          setPetState({isPetAvailable: true, petData: petJson})
        } else {
          console.log("checked db: no pet");
          // setPetData(null);
          setPetState({...petState, petData: null})
        }
      })
  }, []);

  // If user has pet
  if (petState.petData) {
    // unpacking petState object
    let {petData} = petState;
    console.log("Existing pet data, rendering CurrentPet");
    alert("Your pet is so cute!");
    return(
      <CurrentPet
      pet={petData}
      petState={petState}
      setPetState={setPetState} />
    )
  // If user doesn't have pet
  } else if (petState.petData === null) {
    console.log("NO pet data, rendering PetGenerator");
    alert("Looks like you don't have a pet yet! Let's fix that.");
    return (
      <PetGenerator
      petState={petState}
      setPetState={setPetState} />
    )
  // If user's pet status is unknown (i.e. useEffect hasn't run)
  } else {
    console.log("the void");
    return (
      <div>Loading...</div>
    )
  } 
}


ReactDOM.render(<VirtualPetApp />, document.querySelector("#app")); 
