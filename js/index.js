import van from "./van-1.2.8.min.js"

const  {div, p, img, input, span, ul, li, h2, h3, small} = van.tags;

const statsDisplay = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp.Atk',
  'special-defense': 'Sp.Def',
  'speed': 'Speed'
}

let knownPokemons = JSON.parse(localStorage.getItem('pokemons'));
knownPokemons ||= [];

const Pokedex = () => div({class: 'pokedex-container'},
  img({src: 'images/pokedex.svg', id: 'pokedex'}), 
  span({class: "circle-light"}),
  div({class: 'display-one'}),
  div({class: 'display-two'}),
  input({type: 'text', id: 'search-input', onkeyup: (e) => fetchPokemon(e), placeholder: 'type a POKéMON\'s name'}),
  span({id: 'counter'}, `${knownPokemons.length}/1025`)
)

van.add(document.body, Pokedex());

const fetchPokemon = (e) => {
  if (e.key !== "Enter") return;
  const userInput = document.getElementById('search-input');
  const previousEntry = knownPokemons.find(pokemon=>pokemon.name == userInput.value);
  if (previousEntry) {
    displayInfo(previousEntry);
  } else if (userInput !== '') {
    fetch(`https://pokeapi.co/api/v2/pokemon/${userInput.value}`)
      .then(response=>response.ok ? response.json() : turnOffDisplay())
      .then(data=>{
        if (data && data.sprites) {
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}/`)
            .then(response=>response.json())
            .then(dataDescription=>{
              // generating new entry
              const newEntry = {
                stats: {},
                img: data.sprites.other['official-artwork'].front_default,
                name: data.name,
                description: dataDescription.flavor_text_entries.find(desc=>desc.language.name == 'en').flavor_text,
                cry: data.cries.latest,
                id: data.id,
                types: data.types.map(type=> type.type.name),
                weight: data.weight,
                height: data.height
              }
              data.stats.forEach(statItem => {
                newEntry.stats[statItem.stat.name] = statItem.base_stat
              });
              // end new entry
              displayInfo(newEntry)
              knownPokemons.push(newEntry)
              localStorage.setItem('pokemons', JSON.stringify(knownPokemons));
              document.getElementById('counter').innerText = `${knownPokemons.length}/1025`;
            })
        }
      })
  }
}

const turnOffDisplay = () => {
  const userInput = document.getElementById('search-input');
  const displayOne = document.querySelector('.display-one');
  const displayTwo = document.querySelector('.display-two');
  displayOne.style= 'background: linear-gradient(45deg, #80800080 10%, #90ee907d 30%, #90ee907d 45%, #80800080 90%); filter: brightness(.4); box-shadow: 0 0 0 2px olive, inset 0 0 2vh #80800080;';
  displayTwo.innerHTML = ''
  userInput.value = ''
  return false
}

const displayInfo = (pokemon) => {
  const userInput = document.getElementById('search-input');
  const displayOne = document.querySelector('.display-one');
  const displayTwo = document.querySelector('.display-two');
  displayOne.style = `background: url(${pokemon.img}) no-repeat, linear-gradient(45deg, #80800080 10%, #90ee907d 30%, #90ee907d 45%, #80800080 90%); box-shadow: inset 0.3vh 0.3vh olive, inset 0 0 2vh #80800080, 0 0 4vh 0vh #cdff80; filter: brightness(1.2)`;

  displayTwo.innerHTML = ''
  van.add(displayTwo, Info(pokemon));
  const audio = new Audio(pokemon.cry);
  audio.play();
  audio.addEventListener("ended", () => {
    setTimeout(() => {
      speakMessage(`${pokemon.name}. ${pokemon.description}`);
      userInput.value = ''
    }, 700);
  })
}

const Info = ({name, description, stats, height, weight, id, types}) => div(
  h2(small(`No.${id} `), name.toUpperCase()),
  p(description),
  div({class: 'line-info'},
  div({class: 'dimensions-info'},
      h3('Height'),
      span(`${Number(height)/10}m`),
      h3('Weight'),
      span(`${Number(weight)/10}kg`)
    ),
    div(
      h3('Type'),
      div({class: 'line-type'},
        types.map(type=>span({class: type}, type))
      )
    )
  ),
  h3('Stats'),
  ul(
    Object.keys(stats).map(stat=>li(span(`${statsDisplay[stat]}:`), span(stats[stat])))
  )
)

function speakMessage(message, PAUSE_MS = 500) {
  try {
    const circleLight = document.querySelector('.circle-light');
    circleLight.classList.add('animate');
    const messageParts = message.split('.')

    let currentIndex = 0
    const speak = (textToSpeak) => {
      const msg = new SpeechSynthesisUtterance();
      const voices = window.speechSynthesis.getVoices();
      msg.voice = voices[0];
      msg.volume = 1; // 0 to 1
      msg.rate = 1; // 0.1 to 10
      msg.pitch = .1; // 0 to 2
      msg.text = textToSpeak;
      msg.lang = 'en-US';

      msg.onend = function() {
        currentIndex++;
        if (currentIndex < messageParts.length) {
          setTimeout(() => {
            speak(messageParts[currentIndex])
          }, PAUSE_MS)
        } else {
          circleLight.classList.remove('animate');
        }
      };
      speechSynthesis.speak(msg);
    }
    speak(messageParts[0])
  } catch (e) {
    console.error(e)
  }
}