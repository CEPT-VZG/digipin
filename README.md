# DIGIPIN API by Department of Posts

<div align="center" style="display: flex; justify-content: center; align-items: center; gap: 20px;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Ministry_of_Communications_India.svg/1920px-Ministry_of_Communications_India.svg.png" alt="Ministry of Communications" width="240"/>
  <img src="https://dev.cept.gov.in/mydigipin/_next/image?url=%2Fmydigipin%2Fimages%2Findiapost_logo_v2.webp&w=1920&q=75" alt="India Post" width="120"/>
</div>

## A Geospatial Addressing Solution by India Post

DIGIPIN (Digital PIN) is a 10-character alphanumeric geocode developed by the Department of Posts, India. It provides a precise, user-friendly way to encode geographic coordinates that can be easily shared and decoded back to latitude/longitude pairs.

This open-source Node.js (Nest.js) project exposes a public API to generate and decode DIGIPINs, supporting geolocation services, postal logistics, and spatial analysis applications.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-v20.18+-green.svg)](https://nodejs.org/)
[![Nest.js](https://img.shields.io/badge/Nest.js-v11+-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7+-blue.svg)](https://www.typescriptlang.org/)

---

## 🏛️ About DIGIPIN

The Department of Posts has undertaken an initiative to establish a Digital Public Infrastructure (DPI) for a standardized, geo-coded addressing system in India. DIGIPIN represents the foundation layer of this infrastructure.

Developed in collaboration with IIT Hyderabad and NRSC (National Remote Sensing Centre, ISRO), DIGIPIN is an open-source national-level addressing grid that serves as a key component of India's digital address ecosystem.

After extensive public consultation and expert review, the DIGIPIN Grid has been finalized to provide simplified addressing solutions for seamless delivery of public and private services, enabling "Address as a Service" (AaaS) across the country.

### Key Highlights

- **Uniform Referencing Framework**: Provides logical, precise location identification both offline and online
- **GIS Integration**: Bridges the gap between physical and digital addresses
- **Cross-Sector Support**: Enhances service delivery across emergency response, e-commerce, logistics, BFSI, and governance
- **Policy Alignment**: Complies with the National Geospatial Policy 2022, enriching India's geospatial knowledge stack

DIGIPIN simplifies address management and enhances service delivery accuracy, promoting a thriving geospatial ecosystem for India's digital economy.

---

## ✨ Features

- **Encode**: Convert latitude and longitude into a compact 10-character DIGIPIN
- **Decode**: Transform a DIGIPIN back to its center-point coordinates
- **Lightweight**: Optimized for performance and minimal resource usage
- **RESTful API**: Clean, standard-compliant endpoints
- **Interactive Documentation**: Comprehensive Swagger UI for easy exploration
- **Production-Ready**: Built with Node.js and Nest.js for reliability and scalability in enterprise-grade applications. 

---

## 📦 Installation

### Prerequisites

- Node.js (v20.18 or higher)
- npm (v10.8 or higher)

### Getting Started

1. **Clone the Repository**

```bash
git clone https://github.com/CEPT-VZG/digipin.git
cd digipin
```

2. **Install Dependencies**

```bash
npm install
```

3. **Environment Setup**

Not needed.

4. **Start the Server**

```bash
npm start
```

For development with hot reloading:

```bash
npm run start:dev
```

The API will be available at `http://localhost:5000/api/v1`.

---

## 🚀 API Usage

### Encode Coordinates to DIGIPIN

```
GET /api/v1/digipin/encode?latitude=12.9716&longitude=77.5946
```

**Response:**

```json
{"success":true,"digipin":"4P3-JK8-52C9"}
```

### Decode DIGIPIN to Coordinates

```
GET /api/v1/digipin/decode?digipin=4P3-JK8-52C9
```

**Response:**

```json
{"success":true,"latitude":12.971601,"longitude":77.594584}
```

### Interactive API Documentation

Access the Swagger UI documentation at:

```
http://localhost:5000/api/v1/api-docs
```

---
 
## 🔧 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code adheres to the existing style and passes all tests.

---

## 📜 License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Department of Posts, Government of India
- Indian Institute of Technology, Hyderabad
- National Remote Sensing Centre, ISRO

---

*Transforming addresses for Digital India*