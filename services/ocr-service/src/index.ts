import { BrokerType, ExtractedHolding, OCRResult } from '@financial-portfolio/types';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';

// Broker template configurations
const BROKER_TEMPLATES = {
  STREAMING: {
    patterns: {
      symbol: /([A-Z0-9]{2,10})/,
      quantity: /จำนวน[:\s]*([0-9,]+)/,
      avgCost: /ต้นทุนเฉลี่ย[:\s]*([0-9,.]+)/,
      currentPrice: /ราคาปัจจุบัน[:\s]*([0-9,.]+)/,
    },
  },
  SETTRADE: {
    patterns: {
      symbol: /([A-Z0-9]{2,10})/,
      quantity: /Vol[:\s]*([0-9,]+)/,
      avgCost: /Avg[:\s]*([0-9,.]+)/,
      currentPrice: /Last[:\s]*([0-9,.]+)/,
    },
  },
  KTB: {
    patterns: {
      symbol: /([A-Z0-9]{2,10})/,
      quantity: /หน่วย[:\s]*([0-9,]+)/,
      avgCost: /ต้นทุน[:\s]*([0-9,.]+)/,
      currentPrice: /ราคา[:\s]*([0-9,.]+)/,
    },
  },
};

/**
 * OCR Service for extracting portfolio data from broker screenshots
 */
export class OCRService {
  /**
   * Preprocess image for better OCR accuracy
   */
  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();
  }

  /**
   * Detect broker type from image
   */
  private async detectBrokerType(text: string): Promise<BrokerType | null> {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('streaming') || lowerText.includes('สตรีมมิ่ง')) {
      return BrokerType.STREAMING;
    } else if (lowerText.includes('settrade') || lowerText.includes('เซ็ตเทรด')) {
      return BrokerType.SETTRADE;
    } else if (lowerText.includes('ktb') || lowerText.includes('กรุงไทย')) {
      return BrokerType.KTB;
    } else if (lowerText.includes('finnomena') || lowerText.includes('ฟินโนมีน่า')) {
      return BrokerType.FINNOMENA;
    } else if (lowerText.includes('scb') || lowerText.includes('ไทยพาณิชย์')) {
      return BrokerType.SCB;
    }

    return null;
  }

  /**
   * Extract holdings data based on broker template
   */
  private extractHoldings(text: string, brokerType: BrokerType): ExtractedHolding[] {
    const template = BROKER_TEMPLATES[brokerType];
    if (!template) {
      return [];
    }

    const holdings: ExtractedHolding[] = [];
    const lines = text.split('\n');

    let currentSymbol: string | null = null;
    let quantity: number | null = null;
    let avgCost: number | null = null;
    let currentPrice: number | null = null;

    for (const line of lines) {
      // Try to extract symbol
      const symbolMatch = line.match(template.patterns.symbol);
      if (symbolMatch && symbolMatch[1].length >= 2) {
        if (currentSymbol && quantity && avgCost && currentPrice) {
          // Save previous holding
          holdings.push({
            symbol: currentSymbol,
            quantity,
            averageCost: avgCost,
            currentPrice,
            confidence: 0.8, // Base confidence
          });
        }
        currentSymbol = symbolMatch[1];
        quantity = null;
        avgCost = null;
        currentPrice = null;
      }

      // Try to extract quantity
      const quantityMatch = line.match(template.patterns.quantity);
      if (quantityMatch) {
        quantity = parseFloat(quantityMatch[1].replace(/,/g, ''));
      }

      // Try to extract average cost
      const avgCostMatch = line.match(template.patterns.avgCost);
      if (avgCostMatch) {
        avgCost = parseFloat(avgCostMatch[1].replace(/,/g, ''));
      }

      // Try to extract current price
      const currentPriceMatch = line.match(template.patterns.currentPrice);
      if (currentPriceMatch) {
        currentPrice = parseFloat(currentPriceMatch[1].replace(/,/g, ''));
      }
    }

    // Save last holding
    if (currentSymbol && quantity && avgCost && currentPrice) {
      holdings.push({
        symbol: currentSymbol,
        quantity,
        averageCost: avgCost,
        currentPrice,
        confidence: 0.8,
      });
    }

    return holdings;
  }

  /**
   * Calculate confidence score for OCR result
   */
  private calculateConfidence(holdings: ExtractedHolding[]): number {
    if (holdings.length === 0) return 0;

    const avgConfidence =
      holdings.reduce((sum, h) => sum + h.confidence, 0) / holdings.length;

    // Additional validation checks
    let validationScore = 1.0;

    holdings.forEach((holding) => {
      // Check if values are reasonable
      if (holding.quantity <= 0 || holding.averageCost <= 0 || holding.currentPrice <= 0) {
        validationScore *= 0.5;
      }

      // Check if symbol is valid format
      if (!/^[A-Z0-9]{2,10}$/.test(holding.symbol)) {
        validationScore *= 0.7;
      }
    });

    return avgConfidence * validationScore;
  }

  /**
   * Process screenshot and extract portfolio data
   */
  async processScreenshot(
    imageBuffer: Buffer,
    brokerType?: BrokerType
  ): Promise<OCRResult> {
    try {
      // Preprocess image
      const processedImage = await this.preprocessImage(imageBuffer);

      // Perform OCR
      const {
        data: { text },
      } = await Tesseract.recognize(processedImage, 'eng+tha', {
        logger: (m) => console.log(m),
      });

      // Detect broker type if not provided
      let detectedBrokerType = brokerType;
      if (!detectedBrokerType) {
        detectedBrokerType = await this.detectBrokerType(text);
      }

      if (!detectedBrokerType) {
        throw new Error('Unable to detect broker type');
      }

      // Extract holdings
      const holdings = this.extractHoldings(text, detectedBrokerType);

      // Calculate confidence
      const confidence = this.calculateConfidence(holdings);

      // Generate session ID (in real implementation, save to database)
      const sessionId = `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        sessionId,
        brokerType: detectedBrokerType,
        confidence,
        extractedData: holdings,
        requiresReview: confidence < 0.9,
        imageUrl: '', // In real implementation, upload to storage
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error(`OCR processing failed: ${error}`);
    }
  }
}

export default new OCRService();
