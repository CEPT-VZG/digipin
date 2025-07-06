const { getDigipinGlobal } = require("../digipinglobal");



describe('DIGIPIN Encoder and Decoder Tests', () => {
  
  describe('getDigiPin - Encoding Tests', () => {
    
    test('should encode valid coordinates within India bounds', () => {
      // Test Delhi coordinates
      const delhiLat = 28.6139;
      const delhiLon = 77.2090;
      const digiPin = getDigipinGlobal(delhiLat, delhiLon);
      
      expect(digiPin).toBeTruthy();
      expect(digiPin.length).toBe(15); // 3 + 10 characters + 2 hyphens
      expect(digiPin).toBe("00-39J-438-TJC7");
    });


  });
});