/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import {sessionStorageMock} from "../__mocks__/sessionStorage.js";
import userEvent from "@testing-library/user-event";


jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
/* action et affichage modale quand clic bouton "nouvelle note de frais" */
describe("When I click on new bill button ", () => {
  test("Then a modal should open", () => {
    sessionStorageMock('Employee')
    document.body.innerHTML = BillsUI({data: bills,});
    const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname, }); };
    const newBill = new Bills({ document, onNavigate, store: null, bills, localStorage: localStorageMock})
    const handleClickNewBill = jest.fn((e) => newBill.handleClickNewBill(e, bills))
    const iconNewBill = screen.getByTestId("btn-new-bill");
    iconNewBill.addEventListener("click", handleClickNewBill);
    fireEvent.click(iconNewBill);
    /* vérification de l'appel de la fonction handleClickNewBill */
    expect(handleClickNewBill).toHaveBeenCalled();
    /* vérification de l'affichage de la modale par la présence du noeud DOM
    id="form-new-bill") */
    const modale = screen.getAllByTestId("form-new-bill");
    expect(modale).toBeTruthy();
  })
})
/* test action et affichage modale quand clic icône oeil bleu */
describe("When I click on the blue eye icon", () => {
  test("Then modal should be displayed with its content", async () => {
    sessionStorageMock('Employee')
    document.body.innerHTML='<div id="root"></div>'
    router()
    window.onNavigate(ROUTES_PATH.Bills)
    const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
    $.fn.modal= jest.fn(function() {this[0].classList.add('show') })
    const billsList = new Bills({document, onNavigate, store : mockStore, localStorage: null})
    const bills = await billsList.getBills()
    document.body.innerHTML = BillsUI({ data: bills })
    const firstEye = screen.getAllByTestId("icon-eye").shift()
    const handleClickIconEye = jest.fn(() => billsList.handleClickIconEye(firstEye))
    firstEye.addEventListener('click', handleClickIconEye)
    userEvent.click(firstEye)
    /* vérification de l'appel de la fonction handleClickIconEye */
    expect(handleClickIconEye).toBeCalled()
    /* vérification de l'affichage de la modale par la présence de la classe .show */
    expect(document.querySelector(".show")).toBeTruthy()
  })
})
/* Test d'intégration GET */
test("fetches bills from mock API GET", async () => {
  sessionStorageMock('Employee')
  document.body.innerHTML='<div id="root"></div>'
  router()
  window.onNavigate(ROUTES_PATH.Bills)
  const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
  const billsList = new Bills({document, onNavigate, store : mockStore, localStorage: null})
  const bills = await billsList.getBills()
  document.body.innerHTML = BillsUI({ data: bills })
  const billsCount  = screen.getByTestId("tbody").childElementCount
  /* Vérification si les 4 bills du mock sont récupérées*/
  expect(billsCount).toEqual(4)
})
