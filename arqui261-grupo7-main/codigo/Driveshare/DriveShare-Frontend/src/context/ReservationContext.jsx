import { createContext, useState, useContext } from "react";

const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
    // Guarda el objeto del vehículo actual seleccionado
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    
    // Guarda fechas y locaciones temporales del alquiler
    const [checkoutDetails, setCheckoutDetails] = useState({
        startDate: null,
        endDate: null,
        pickupLocation: "",
        returnLocation: "",
        totalPrice: 0
    });

    const clearReservation = () => {
        setSelectedVehicle(null);
        setCheckoutDetails({
            startDate: null,
            endDate: null,
            pickupLocation: "",
            returnLocation: "",
            totalPrice: 0
        });
    };

    return (
        <ReservationContext.Provider value={{ 
            selectedVehicle, 
            setSelectedVehicle, 
            checkoutDetails, 
            setCheckoutDetails,
            clearReservation
        }}>
            {children}
        </ReservationContext.Provider>
    );
};

export function useReservation() {
    return useContext(ReservationContext);
}