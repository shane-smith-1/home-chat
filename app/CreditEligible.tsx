import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { form5695, instructionsForm5695 } from "../src/utils/form5695";
import classNames from "classnames";

export const thingsEligibleForTaxCredit = [
  "Exterior doors",
  "Exterior windows and skylights",
  "Insulation and air sealing materials or systems",
  "Home Energy Audits",
  "Central air conditioners",
  "Natural gas, propane, or oil water heaters",
  "Natural gas, propane, or oil furnaces and hot water boilers",
  "Electric or natural gas heat pumps",
  "Electric or natural gas heat pump water heaters",
  "Biomass stoves and boilers",
  "Panelboards, sub-panelboards, branch circuits, or feeders (electrical upgrades)",
  "Insulation materials or systems and air sealing materials or systems (generously match this category)",
];

export default function CreditEligible() {
  // Take in an array of appliances being installed in the home, search local database of appliances for energy star status of appliance, determine if appliance is eligible for tax credit, and return the amount of the tax credit for each appliance.
  // If not eligible, return a message stating that the appliance is not eligible for a tax credit.
  // Do a search for similar appliances that are eligible for a tax credit and return the amount of the tax credit for each appliance.
  // Do a cost analysis and comparison of the appliances that are eligible, and compare to what is being installed now.
  // If the cost of the eligible appliances is less than the cost of the appliances being installed, return a message stating that the homeowner can save money by installing the eligible appliances.
  // If the cost of the eligible appliances is more than the cost of the appliances being installed, return a message stating that the homeowner will not save money by installing the eligible appliances.
}
