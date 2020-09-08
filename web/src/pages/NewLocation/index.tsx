import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import {LeafletMouseEvent} from 'leaflet';

import './styles.css';
import logo from '../../assets/logo.svg';
import api from '../../services/api';


interface Item{
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string  // Attribute from the received JSON
}

interface IBGECityResponse {
    nome: string  // Attribute from the received JSON
}

const NewLocation = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUFs] = useState<string[]>([]);
    const [cities, setCities] =useState<string[]>([]);
    const [initialMapPosition, setInitialMapPosition] = useState<[number, number]>([-19.975, -44.069])
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });
    const [selectedUF, setSelectedUF] = useState('0');  // Keeps track of the state the user selected
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedMapPosition, setSelectedMapPosition] = useState<[number, number]>([0, 0])
    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;

            setInitialMapPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []);

    // IBGE's API for state initials (UFs)
    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const stateInitials = response.data.map(uf => uf.sigla)
            setUFs(stateInitials);
        });
    }, []);

    useEffect(() => {
        // Load cities list everytime user changes the selected state/UF
        if (selectedUF === '0') {
            return;
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome)
            setCities(cityNames);
        });

    }, [selectedUF ]);

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value
        setSelectedUF(uf);
    }
 
    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value
        setSelectedCity(city);
    }

    function handeleMapClick(event: LeafletMouseEvent) {
        setSelectedMapPosition([
            event.latlng.lat, 
            event.latlng.lng
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({ ...formData, [name]: value });
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems)

        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        const { name, email, whatsapp } = formData;
        const state = selectedUF;
        const city = selectedCity;
        const [latitude, longitude] = selectedMapPosition;
        const items = selectedItems;

        const payload = {
            name, 
            email,
            whatsapp,
            state,
            city, 
            latitude,
            longitude,
            items,
        }
        await api.post('locations', payload);

        alert('Ponto de coleta registrado!')
        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">
                            Nome da entidade
                        </label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">
                                E-mail
                            </label>
                            <input type="email" name="email" id="email" onChange={handleInputChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">
                                Whatsapp
                            </label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereços</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={initialMapPosition} zoom={15} onClick={handeleMapClick}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
                        />
                        <Marker position={selectedMapPosition}/>
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="state">Estado</label>
                            <select name="state" id="uf" value={selectedUF} onChange={handleSelectUF}>
                                <option value="0">Selecione um estado</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity} >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option> 
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Seleciona um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => handleSelectItem(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                <img src={item.image_url} alt={item.title}/>
                                <span>
                                    {item.title}
                                </span>
                            </li>
                        ))}

                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
}

export default NewLocation;