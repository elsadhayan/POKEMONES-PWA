const URL_API = 'https://pokeapi.co/api/v2/pokemon?limit=20';
const container = document.getElementById('pokemon-container');

document.addEventListener('DOMContentLoaded', () => {
    obtenerPokemones();
});

async function obtenerPokemones() {
    try {
        const respuesta = await fetch(URL_API);
        const data = await respuesta.json();
        
        for (let pokemon of data.results) {
            await obtenerDetallePokemon(pokemon.url);
        }
    } catch (error) {
        console.error('Error al obtener la lista de pokemones:', error);
    }
}

async function obtenerDetallePokemon(url) {
    try {
        const res = await fetch(url);
        const poke = await res.json();
        crearCard(poke);
    } catch (error) {
        console.error('Error al obtener detalle:', error);
    }
}

function crearCard(poke) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    
    const imagen = poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default;
    const tipos = poke.types.map(t => t.type.name).join(', ');

    card.innerHTML = `
        <img src="${imagen}" alt="${poke.name}">
        <h3>#${poke.id} - ${poke.name.toUpperCase()}</h3>
        <p>Tipo: ${tipos}</p>
        <button onclick="verDetalle(${poke.id})">Ver detalles</button>
    `;
    
    container.appendChild(card);
}

function verDetalle(id) {
    window.location.href = `detalle.html?id=${id}`;
}