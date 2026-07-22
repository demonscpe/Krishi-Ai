import { useContext, createContext, useState, useEffect, useRef } from "react";
import axios from "axios";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const [weather, setWeather] = useState({});
    const [values, setValues] = useState([]);
    const [place, setPlace] = useState("Chittoor");
    const [thisLocation, setLocation] = useState("");

    const hasFetched = useRef(false);

    const fetchWeather = async () => {
        if (!place) return;

        const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
        if (!apiKey || apiKey === "your_rapidapi_key_here") {
            console.warn("Weather API key not set. Add VITE_RAPIDAPI_KEY to your .env file.");
            return;
        }

        try {
            const response = await axios.get(
                "https://visual-crossing-weather.p.rapidapi.com/forecast",
                {
                    params: {
                        aggregateHours: "24",
                        location: place,
                        contentType: "json",
                        unitGroup: "metric",
                    },
                    headers: {
                        "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
                        "X-RapidAPI-Host": "visual-crossing-weather.p.rapidapi.com",
                    },
                }
            );

            const data = Object.values(response.data.locations)[0];

            setLocation(data.address);
            setValues(data.values);
            setWeather(data.values[0]);

            localStorage.setItem("lastWeather", JSON.stringify(data.values[0]));
        } catch (e) {
            console.error("API Error:", e.response?.status);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const cached = localStorage.getItem("lastWeather");
        if (cached) {
            try { setWeather(JSON.parse(cached)); } catch {}
            return;
        }

        fetchWeather();
    }, []);

    return (
        <StateContext.Provider value={{ weather, setPlace, values, thisLocation, place }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);