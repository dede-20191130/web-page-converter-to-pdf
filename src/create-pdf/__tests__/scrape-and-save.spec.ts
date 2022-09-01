
import puppeteer, { Browser, HTTPRequest, HTTPResponse, Page, TimeoutError } from 'puppeteer';
// @ts-ignore
import { loggerMock as untypedLoggerMock } from '../logging';
import { loggerMock as typedLoggerMock } from '../__mocks__/logging';
import { scrapeAndSave, STATUS } from '../scrape-and-save';
import path from 'path';

jest.mock("../logging");
const loggerMock = untypedLoggerMock as typeof typedLoggerMock;

const mockedPageGoto= (jest.fn() as jest.MockedFunction<Page["goto"]>).mockImplementation(async () => {
    return new HTTPResponse();
});
const mockedPageTitle=(jest.fn() as jest.MockedFunction<Page["title"]>).mockResolvedValue("SOME-PAGE-TITLE");
const mockedResStatus = jest.fn() as jest.MockedFunction<HTTPResponse["status"]>;
const mockedResRequest = jest.fn<{
    redirectChain: () => { length: number }
},
    any
>();
const mockedPdfCreationFunc=jest.fn();
jest.mock("puppeteer", () => {
    return {
        ...jest.requireActual("puppeteer"),
        Browser: function (): Partial<puppeteer.Browser> {
            return {
                newPage: (jest.fn() as jest.MockedFunction<Browser["newPage"]>).mockImplementation(async () => {
                    return new Page();
                })
            }
        },
        Page: function (): Partial<puppeteer.Page> {
            return {
                goto: mockedPageGoto,
                title: mockedPageTitle,
                close:jest.fn(),
                waitForTimeout:jest.fn(),
                pdf:mockedPdfCreationFunc,
            }
        },
        HTTPResponse: function (): Partial<puppeteer.HTTPResponse> {
            return {
                status: mockedResStatus,
                request: mockedResRequest as any
            }
        },
    }
});


const targetUrl = "https//example.com/target-page"
let browser: Browser
let spyedJoin: jest.SpyInstance;
beforeAll(() => {
    browser = new Browser();
    mockedResRequest.mockReturnValue({
        redirectChain: () => {
            return {
                length: 0
            }
        }
    });
});

beforeEach(() => {
    spyedJoin = jest.spyOn(path, "join");
});
afterEach(() => {
    jest.clearAllMocks();
    mockedResStatus.mockReset();
});

describe('handle various cases of accessing a webpage', () => {
    
    it('for a page that can be saved as pdf',async() => {
        mockedResStatus.mockReturnValue(200);
        const scrapeResult = await scrapeAndSave(targetUrl, browser);
        expect(loggerMock.warn).not.toHaveBeenCalled();
        expect(loggerMock.error).not.toHaveBeenCalled();
        expect(spyedJoin.mock.calls[0][1]).toBe("SOME-PAGE-TITLE.pdf");
        expect(mockedPdfCreationFunc).toHaveBeenCalled();
        expect(scrapeResult).toBe("CREATE-PDF-SUCCESSFULLY");
        
    });
    it('for a page that responds with 100',async () => {
        mockedResStatus.mockReturnValue(100);
        const scrapeResult = await scrapeAndSave(targetUrl, browser);
        expect(loggerMock.warn).toHaveBeenCalledWith(`The page of %s failed to open properly`,targetUrl);
        expect(loggerMock.error).not.toHaveBeenCalled();
        expect(spyedJoin).not.toHaveBeenCalled();
        expect(mockedPdfCreationFunc).not.toHaveBeenCalled();
        expect(scrapeResult).toBe<STATUS>("FAILED-TO-OPEN-PROPERLY");
        
    });
    it('for a page that responds with 404',async () => {
        mockedResStatus.mockReturnValue(404);
        const scrapeResult = await scrapeAndSave(targetUrl, browser);
        expect(loggerMock.warn).toHaveBeenCalledWith(`The page of %s failed to open properly`,targetUrl);
        expect(loggerMock.error).not.toHaveBeenCalled();
        expect(spyedJoin).not.toHaveBeenCalled();
        expect(mockedPdfCreationFunc).not.toHaveBeenCalled();
        expect(scrapeResult).toBe<STATUS>("FAILED-TO-OPEN-PROPERLY");
        
    });
    it('for a page that are redirected',async () => {
        mockedResStatus.mockReturnValue(200);
        mockedResRequest.mockReturnValueOnce({
            redirectChain: () => {
                return {
                    length: 1
                }
            }
        });
        const scrapeResult = await scrapeAndSave(targetUrl, browser);
        expect(loggerMock.warn).toHaveBeenCalledWith(`The page of %s failed to open properly`,targetUrl);
        expect(loggerMock.error).not.toHaveBeenCalled();
        expect(spyedJoin).not.toHaveBeenCalled();
        expect(mockedPdfCreationFunc).not.toHaveBeenCalled();
        expect(scrapeResult).toBe<STATUS>("FAILED-TO-OPEN-PROPERLY");
        
    });
    it('for a page that responds with timeout-error',async () => {
        const timeoutError = new TimeoutError()
        mockedResStatus.mockReturnValue(200);
        mockedPageGoto.mockRejectedValueOnce(timeoutError);
        const scrapeResult = await scrapeAndSave(targetUrl, browser);
        expect(loggerMock.warn).not.toHaveBeenCalled();
        expect(loggerMock.error).toHaveBeenCalledWith(timeoutError);
        expect(spyedJoin).not.toHaveBeenCalled();
        expect(mockedPdfCreationFunc).not.toHaveBeenCalled();
        expect(scrapeResult).toBe<STATUS>("FAILED-BY-TIMEOUT-ERROR");
        
    });
});

it('should sanitize the page"s title',async () => {
    mockedPageTitle.mockResolvedValue("sanitization??-required>-*title")
    mockedResStatus.mockReturnValue(200);
    const scrapeResult = await scrapeAndSave(targetUrl, browser);
    expect(loggerMock.warn).not.toHaveBeenCalled();
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(spyedJoin.mock.calls[0][1]).toBe("sanitization-required-title.pdf");
    expect(mockedPdfCreationFunc).toHaveBeenCalled();
    expect(scrapeResult).toBe<STATUS>("CREATE-PDF-SUCCESSFULLY");
    
});