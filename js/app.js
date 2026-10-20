const URL_API = 'https://pokeapi.co/api/v2/pokemon?limit=20';
const container = document.getElementById('pokemon-container');
const vistaLista = document.getElementById('vista-lista');
const vistaDetalle = document.getElementById('vista-detalle');
const detalleContainer = document.getElementById('detalle-container');

// Objeto para almacenar todos los datos de los pokémon en memoria local
const pokemonesData = {};

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
        console.error('Error al obtener la lista:', error);
    }
}

async function obtenerDetallePokemon(url) {
    try {
        const res = await fetch(url);
        const poke = await res.json();
        
        // Guardamos el objeto completo del pokémon en memoria
        pokemonesData[poke.id] = poke;
        
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

// Muestra la vista de detalles leyendo directo de la memoria (Cero errores offline)
function verDetalle(id) {
    const poke = pokemonesData[id];
    if (!poke) return;

    vistaLista.classList.add('oculto');
    vistaDetalle.classList.remove('oculto');
    window.scrollTo(0, 0);

    const imagen = poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default;
    const tipos = poke.types.map(t => `<span class="badge-tipo">${t.type.name}</span>`).join(' ');
    const habilidades = poke.abilities.map(a => a.ability.name).join(', ');
    const stats = poke.stats.map(s => `<li><span>${s.stat.name.toUpperCase()}</span> <strong>${s.base_stat}</strong></li>`).join('');

    detalleContainer.innerHTML = `
        <img src="${imagen}" alt="${poke.name}">
        <h2>#${poke.id} - ${poke.name.toUpperCase()}</h2>
        <div class="tipos-container">${tipos}</div>
        <div class="info-grid">
            <p><strong>Altura:</strong> ${poke.height / 10} m</p>
            <p><strong>Peso:</strong> ${poke.weight / 10} kg</p>
        </div>
        <p class="habilidades"><strong>Habilidades:</strong> ${habilidades}</p>
        <hr class="separador">
        <h3>Estadísticas Base</h3>
        <ul class="stats-list">${stats}</ul>
    `;
}

function cerrarDetalle() {
    vistaDetalle.classList.add('oculto');
    vistaLista.classList.remove('oculto');
}