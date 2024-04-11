import React, { useState, useRef, useEffect } from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import Search from 'react-leaflet-search/lib';
import 'leaflet/dist/leaflet.css';
import osm from './osm-providers';
import {
    Box,
    Button,
    Container,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    makeStyles,
} from '@material-ui/core';
import useGeoLocation from '../hooks/useGeoLocationHook';

const ZOOM_LEVEL = 9;

const markerIcon = new L.Icon({
    iconUrl: require('../assests/marker.png'),
    iconSize: [40, 40],
    iconAnchor: [17, 46],
    popupAnchor: [0, -46],
});

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    root: {
        paddingTop: 20,
    },
});

const MarkersMap = () => {
    const classes = useStyles();
    const [center, setCenter] = useState({
        lat: 13.08,
        lng: 80.24,
        zoom: 4,
    });
    const [locationData, setLocationData] = useState([]);

    useEffect(() => {
        const datas = JSON.parse(localStorage.getItem('mapData')) || [];
        setLocationData(datas);
    }, []);

    const mapRef = useRef();

    const location = useGeoLocation();

    const showMyLocation = () => {
        if (location.loaded && !location.error) {
            mapRef.current.leafletElement.flyTo(
                [location.coordinates.lat, location.coordinates.lng],
                ZOOM_LEVEL,
                { animate: true }
            );
            setCenter({
                lat: location.coordinates.lat.toFixed(2),
                lng: location.coordinates.lng.toFixed(2),
                zoom: ZOOM_LEVEL,
            });
        } else {
            alert(location.error.message);
        }
    };

    const handleClick = (e) => {
        const map = mapRef.current;
        if (map != null) {
            setCenter({
                lat: e.latlng.lat.toFixed(2),
                lng: e.latlng.lng.toFixed(2),
                zoom: e.target._zoom,
            });
        }
    };

    const addData = () => {
        const locationDataFind = locationData.filter(
            (obj) => obj.latitude === center.lat
        );
        if (!locationDataFind.length) {
            let data = {
                latitude: center.lat,
                longitude: center.lng,
                zoom: center.zoom,
            };
            let dataArray = [...locationData];
            dataArray.push(data);
            setLocationData(dataArray);
            localStorage.setItem('mapData', JSON.stringify(dataArray));
        }
    };

    const handleRemoveItem = (index) => {
        const updatedItems = [...locationData];
        updatedItems.splice(index, 1); // Remove the item at the given index
        setLocationData(updatedItems); // Update state with the modified array
        localStorage.setItem('mapData', JSON.stringify(updatedItems));
    };

    const viewLocation = (object) => {
        if (location.loaded && !location.error) {
            mapRef.current.leafletElement.flyTo(
                [object.latitude, object.longitude],
                ZOOM_LEVEL,
                { animate: true }
            );
            setCenter({
                lat: object.latitude,
                lng: object.longitude,
                zoom: ZOOM_LEVEL,
            });
        }
    };

    const handleExport = () => {
        const csv = (locationData || [])
            .map((row) => Object.values(row).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box className={classes.root}>
            <Container maxWidth="xl">
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={12}>
                        <Map
                            center={center}
                            zoom={center ? center.zoom : 4}
                            ref={mapRef}
                            onClick={(e) => handleClick(e)}
                        >
                            <TileLayer
                                url={osm.maptiler.url}
                                attribution={osm.maptiler.attribution}
                            />

                            {location.loaded && !location.error && (
                                <Marker
                                    icon={markerIcon}
                                    position={center}
                                ></Marker>
                            )}
                            <Search
                                position="topright"
                                inputPlaceholder="Search"
                                showMarker={false}
                                closeResultsOnClick={false}
                                zoom={12}
                            />
                        </Map>
                    </Grid>
                    <Grid container item xs={12} md={8}>
                        <Grid container justifyContent="space-between">
                            <Grid item>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={() => addData()}
                                >
                                    Add Data
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    color="secondary"
                                    variant="contained"
                                    onClick={() => showMyLocation()}
                                >
                                    Locate Me
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={() => handleExport()}
                                >
                                    Export Data
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            justifyContent="space-between"
                            style={{ marginTop: 10 }}
                        >
                            <Grid item xs={12}>
                                <TableContainer component={Paper}>
                                    <Table
                                        className={classes.table}
                                        aria-label="simple table"
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">
                                                    Latitude
                                                </TableCell>
                                                <TableCell align="center">
                                                    Longitude
                                                </TableCell>
                                                <TableCell align="right">
                                                    Action
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {locationData.map(
                                                (object, index) => {
                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell align="center">
                                                                {
                                                                    object.latitude
                                                                }
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {
                                                                    object.longitude
                                                                }
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Box>
                                                                    <IconButton>
                                                                        <VisibilityIcon
                                                                            onClick={() =>
                                                                                viewLocation(
                                                                                    object
                                                                                )
                                                                            }
                                                                        />
                                                                    </IconButton>
                                                                    <IconButton>
                                                                        <DeleteIcon
                                                                            onClick={() =>
                                                                                handleRemoveItem(
                                                                                    index
                                                                                )
                                                                            }
                                                                        />
                                                                    </IconButton>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default MarkersMap;
