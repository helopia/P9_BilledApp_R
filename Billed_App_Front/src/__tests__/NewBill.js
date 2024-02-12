import {fireEvent, screen} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import store from "../__mocks__/store.js"
import {ROUTES, ROUTES_PATH} from '../constants/routes.js'
import router from "../app/Router.js";
import mockStore from "../__mocks__/store.js"
import userEvent from "@testing-library/user-event";
jest.mock("../app/store", () => mockStore)
describe("Given I'm connected as an employee on the NewBill page", () => {
  let newBill;
  beforeEach(() => {
    document.body.innerHTML = NewBillUI();
    Object.defineProperty(window, "localStorage", {value: localStorageMock});
    window.localStorage.setItem("user", JSON.stringify({type: "Employee", email: "employee@test.fr"}));
    newBill = new NewBill({
      document,
      onNavigate: jest.fn(),
      store: store,
      localStorage: localStorageMock
    });
  });
  describe("When I upload a file that is .jpg .jpeg or .png", () => {
    test("Then the form should contain the file", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      const file = new File(["test"], "test.jpg", { type: "image/jpg" });
      const event = { target: { files: [file] }};
      fireEvent.change(fileInput, event);
      expect(fileInput.files[0].name).toBe("test.jpg");
    });
  });
  describe("When I navigate to the NewBill page", () => {
    beforeEach(() => {
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      );
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
    });
    //Test du chargement de la page
    test("Then it should show the Newbill content", async() => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const content = screen.getAllByText("Envoyer une note de frais");
      expect(content).toBeTruthy();
    });
  });
  describe("When I submit a new bill in the form", () => {
    //Test envoi form
    test("Then handleSubmit should've been called", () => {
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newBill.handleSubmit);
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
  describe("When I submit the form and there's an error with the server", () => {
    //erreur 500
    test("Then there is a mistake and it fails with 500 error message", async () => {
      store.bills(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      document.body.innerHTML = BillsUI({error: 'Erreur 500'});
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    });
  });
});
// test POST
describe("Given I am a user connected as Employee", () => {
  describe("When I add a new bill", () => {
    test("Then it creates a new bill", () => {
      document.body.innerHTML = NewBillUI();
      //Initialisation des champs Bills
      const inputData = {
        type: "Transports",
        name: "test",
        datepicker: "2022-06-27",
        amount: "76",
        vat: "70",
        pct: "20",
        commentary: "test",
        file: new File(["test"], "test.png", {type: "image/png"}),
      };
      //On récupère les éléments
      const formNewBill = screen.getByTestId("form-new-bill");
      const inputExpenseName = screen.getByTestId("expense-name");
      const inputExpenseType = screen.getByTestId("expense-type");
      const inputDatepicker = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputVat = screen.getByTestId("vat");
      const inputPct = screen.getByTestId("pct");
      const inputCommentary = screen.getByTestId("commentary");
      const inputFile = screen.getByTestId("file");


      fireEvent.change(inputExpenseName, {target: {value: inputData.name}});
      expect(inputExpenseName.value).toBe(inputData.name);

      fireEvent.change(inputExpenseType, {target: {value: inputData.type}});
      expect(inputExpenseType.value).toBe(inputData.type);

      fireEvent.change(inputDatepicker, {target: {value: inputData.datepicker}});
      expect(inputDatepicker.value).toBe(inputData.datepicker);

      fireEvent.change(inputAmount, {target: {value: inputData.amount}});
      expect(inputAmount.value).toBe(inputData.amount);

      fireEvent.change(inputVat, {
        target: {value: inputData.vat},
      });
      expect(inputVat.value).toBe(inputData.vat);

      fireEvent.change(inputPct, {target: {value: inputData.pct}});
      expect(inputPct.value).toBe(inputData.pct);

      fireEvent.change(inputCommentary, {target: {value: inputData.commentary}});
      expect(inputCommentary.value).toBe(inputData.commentary);

      userEvent.upload(inputFile, inputData.file);
      expect(inputFile.files[0]).toStrictEqual(inputData.file);
      expect(inputFile.files).toHaveLength(1);

      Object.defineProperty(window, "localStorage", {
        value: {getItem: jest.fn(() => JSON.stringify({email: "email@test.com"}))},
        writable: true,
      });
      //simulate navigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname});
      };

      //Init
      const newBill = new NewBill({document, onNavigate, localStorage: window.localStorage});

      //event call
      const handleSubmit = jest.fn(newBill.handleSubmit);
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})
