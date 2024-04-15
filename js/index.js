import van from "./van-1.2.8.min.js"

const  {div, p, img, input, span, ul, li, h2, h3, br, button} = van.tags;

const statsDisplay = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp.Atk',
  'special-defense': 'Sp.Def',
  'speed': 'Speed'
}

const Pokedex = () => div({class: 'pokedex-container'},
  img({src: 'images/pokedex.svg', id: 'pokedex'}), 
  span({class: "circle-light"}),
  div({class: 'display-one'}),
  div({class: 'display-two'}),
  input({type: 'text', id: 'search-input', onblur: () => fetchPokemon(), placeholder: 'type a POKéMON\'s name'})
)

van.add(document.body, Pokedex());

const fetchPokemon = () => {
  const userInput = document.getElementById('search-input');
  const displayOne = document.querySelector('.display-one');
  const displayTwo = document.querySelector('.display-two');
  if (userInput !== '') {
    fetch(`https://pokeapi.co/api/v2/pokemon/${userInput.value}`)
      .then(response=>{
        if (response.ok) {
          return response.json()
        } else {
          userInput.value = ''
          return false
        }
      })
      .then(data=>{
        if (data && data.sprites) {
          displayOne.style.background = `url(${data.sprites.other['official-artwork'].front_default}) no-repeat, linear-gradient(45deg, #80800080 10%, #90ee907d 30%, #90ee907d 45%, #80800080 90%)`;
          displayOne.style.filter = 'brightness(1.2)'
  
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}/`)
            .then(response=>response.json())
            .then(dataDescription=>{
              console.log(dataDescription);
              const description = dataDescription.flavor_text_entries.find(desc=>desc.language.name == 'en')
              displayTwo.innerHTML = ''
              van.add(displayTwo, Info({data: data, description: description}));
              const audio = new Audio(data.cries.latest);
              audio.play();
              audio.addEventListener("ended", () => {
                setTimeout(() => {
                  speakMessage(`${data.name}.${description.flavor_text}`);
                }, 700);
              })
            })
        }
      })
  } else {
    displayOne.style= 'background: linear-gradient(45deg, #80800080 10%, #90ee907d 30%, #90ee907d 45%, #80800080 90%); filter: brightness(.4)';
    displayTwo.innerHTML = ''
  }
}



const Info = ({data, description}) => div(
  h2(data.name.toUpperCase()),
  p(description.flavor_text),
  h3('Dimensions'),
  div({class: 'line-info'},
    div(
      span('Height:'),
      br(),
      span(`${data.height/10}m`)
    ),
    div(
      span('Weight:'),
      br(),
      span(`${data.weight/10}kg`)
    )
  ),
  h3('Type'),
  div({class: 'line-type'},
    data.types.map(item=>span({class: item.type.name}, item.type.name))
  ),
  h3('Stats'),
  ul(
    data.stats.map(statItem=>li(span(`${statsDisplay[statItem.stat.name]}:`), span(statItem.base_stat)))
  )
)

const speak = (text) => {
  // Create a SpeechSynthesisUtterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Select a voice
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices[0]; // Choose a specific voice

  // Speak the text
  speechSynthesis.speak(utterance);
}

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