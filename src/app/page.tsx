"use client";

import { useState, useMemo } from "react";

interface FormData {
  currentAge: string;
  annualIncome: string;
  currentSavings: string;
  monthlySavings: string;
  annualReturn: string;
  desiredRetirementIncome: string;
  socialSecurity: string;
}

interface Results {
  retirementAge: number;
  yearsUntilRetirement: number;
  totalSavingsAtRetirement: number;
  monthlyRetirementIncome: number;
  canRetireNow: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatInputCurrency(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("en-US").format(parseInt(num));
}

function parseInputCurrency(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function calculateRetirement(data: FormData): Results | null {
  const age = parseInt(data.currentAge);
  const savings = parseInt(parseInputCurrency(data.currentSavings));
  const monthly = parseInt(parseInputCurrency(data.monthlySavings));
  const returnRate = parseFloat(data.annualReturn) / 100;
  const desiredIncome = parseInt(
    parseInputCurrency(data.desiredRetirementIncome)
  );
  const ss = parseInt(parseInputCurrency(data.socialSecurity)) * 12;

  if ([age, savings, monthly, desiredIncome].some(isNaN)) return null;
  if (isNaN(returnRate)) return null;

  const annualNeed = desiredIncome - (isNaN(ss) ? 0 : ss);

  if (annualNeed <= 0) {
    return {
      retirementAge: age,
      yearsUntilRetirement: 0,
      totalSavingsAtRetirement: savings,
      monthlyRetirementIncome: Math.round(desiredIncome / 12),
      canRetireNow: true,
    };
  }

  const targetSavings = annualNeed / 0.04;

  if (savings >= targetSavings) {
    return {
      retirementAge: age,
      yearsUntilRetirement: 0,
      totalSavingsAtRetirement: savings,
      monthlyRetirementIncome: Math.round(desiredIncome / 12),
      canRetireNow: true,
    };
  }

  let balance = savings;
  let years = 0;
  const maxYears = 100 - age;

  while (years < maxYears) {
    balance = balance * (1 + returnRate) + monthly * 12;
    years++;
    if (balance >= targetSavings) break;
  }

  if (years >= maxYears) {
    const actualMonthly =
      (balance * 0.04 + (isNaN(ss) ? 0 : ss)) / 12;
    return {
      retirementAge: 100,
      yearsUntilRetirement: maxYears,
      totalSavingsAtRetirement: Math.round(balance),
      monthlyRetirementIncome: Math.round(actualMonthly),
      canRetireNow: false,
    };
  }

  return {
    retirementAge: age + years,
    yearsUntilRetirement: years,
    totalSavingsAtRetirement: Math.round(balance),
    monthlyRetirementIncome: Math.round(desiredIncome / 12),
    canRetireNow: false,
  };
}

function InputField({
  label,
  name,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-medium uppercase tracking-[0.1em] text-gray-500 mb-2"
      >
        {label}
      </label>
      <div className="flex items-baseline border-b border-gray-200 focus-within:border-gray-900 transition-colors duration-200">
        {prefix && (
          <span className="text-sm text-gray-400 pr-1">{prefix}</span>
        )}
        <input
          id={name}
          type={type}
          inputMode={type === "text" ? "numeric" : undefined}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 px-0 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
        {suffix && (
          <span className="text-sm text-gray-400 pl-1">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    currentAge: "",
    annualIncome: "",
    currentSavings: "",
    monthlySavings: "",
    annualReturn: "7",
    desiredRetirementIncome: "",
    socialSecurity: "",
  });

  const [showResults, setShowResults] = useState(false);

  const handleChange = (name: string, value: string) => {
    const currencyFields = [
      "annualIncome",
      "currentSavings",
      "monthlySavings",
      "desiredRetirementIncome",
      "socialSecurity",
    ];

    if (currencyFields.includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: formatInputCurrency(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const results = useMemo(() => calculateRetirement(formData), [formData]);

  const handleCalculate = () => {
    if (results) setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
    setFormData({
      currentAge: "",
      annualIncome: "",
      currentSavings: "",
      monthlySavings: "",
      annualReturn: "7",
      desiredRetirementIncome: "",
      socialSecurity: "",
    });
  };

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-16 h-full flex items-center justify-center">
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-md px-6">
          {!showResults ? (
            <>
              {/* Hero */}
              <div className="pt-24 pb-8 text-center">
                <h1 className="text-3xl md:text-5xl font-light tracking-[0.08em] uppercase text-gray-900 whitespace-nowrap">
                  Kurt&apos;s Retirement Calculator
                </h1>
                <p className="mt-6 text-sm text-gray-500">
                  Answer a few questions about your finances and we&apos;ll
                  estimate when you can stop working.
                </p>
              </div>

              {/* Form */}
              <div className="py-12">
                <div className="space-y-8">
                  <InputField
                    label="Current Age"
                    name="currentAge"
                    value={formData.currentAge}
                    onChange={handleChange}
                    placeholder="30"
                  />
                  <InputField
                    label="Annual Income"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    prefix="$"
                    placeholder="75,000"
                  />
                  <InputField
                    label="Total Savings & Investments"
                    name="currentSavings"
                    value={formData.currentSavings}
                    onChange={handleChange}
                    prefix="$"
                    placeholder="50,000"
                  />
                  <InputField
                    label="Monthly Amount You Save"
                    name="monthlySavings"
                    value={formData.monthlySavings}
                    onChange={handleChange}
                    prefix="$"
                    placeholder="1,000"
                  />
                  <InputField
                    label="Expected Annual Return"
                    name="annualReturn"
                    value={formData.annualReturn}
                    onChange={handleChange}
                    suffix="%"
                    placeholder="7"
                  />
                  <InputField
                    label="Desired Annual Retirement Income"
                    name="desiredRetirementIncome"
                    value={formData.desiredRetirementIncome}
                    onChange={handleChange}
                    prefix="$"
                    placeholder="60,000"
                  />
                  <InputField
                    label="Expected Monthly Social Security"
                    name="socialSecurity"
                    value={formData.socialSecurity}
                    onChange={handleChange}
                    prefix="$"
                    placeholder="2,000"
                  />
                </div>

                <div className="mt-16 flex gap-4">
                  <button
                    onClick={handleCalculate}
                    disabled={!results}
                    className="px-8 py-3.5 bg-gray-900 text-white text-sm font-medium uppercase tracking-wide rounded-none hover:bg-gray-800 active:bg-black transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Calculate
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-8 py-3.5 border border-gray-300 text-gray-900 text-sm font-medium uppercase tracking-wide rounded-none hover:border-gray-900 active:bg-gray-50 transition-colors duration-250"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </>
          ) : (
            results && (
              <>
                {/* Results */}
                <div className="pt-24 pb-8">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400 mb-6">
                    Your Results
                  </p>
                  {results.canRetireNow ? (
                    <h1 className="text-5xl md:text-7xl font-light tracking-[0.08em] uppercase text-gray-900">
                      You Can
                      <br />
                      Retire Now
                    </h1>
                  ) : (
                    <h1 className="text-5xl md:text-7xl font-light tracking-[0.08em] uppercase text-gray-900">
                      Age {results.retirementAge}
                    </h1>
                  )}
                  {!results.canRetireNow && (
                    <p className="mt-6 text-sm text-gray-500">
                      That&apos;s {results.yearsUntilRetirement} years from now.
                    </p>
                  )}
                </div>

                <div className="py-12">
                  <div className="space-y-0">
                    <div className="flex items-center justify-between py-5 border-t border-gray-200">
                      <span className="text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
                        Retirement Age
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {results.retirementAge}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-5 border-t border-gray-200">
                      <span className="text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
                        Years to Go
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {results.yearsUntilRetirement}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-5 border-t border-gray-200">
                      <span className="text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
                        Savings at Retirement
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(results.totalSavingsAtRetirement)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-5 border-t border-gray-200 border-b">
                      <span className="text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
                        Monthly Income in Retirement
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(results.monthlyRetirementIncome)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-8 text-xs text-gray-400 leading-relaxed">
                    Based on the 4% withdrawal rule. Assumes a consistent{" "}
                    {formData.annualReturn}% annual return and no changes to
                    your monthly savings. This is an estimate — not financial
                    advice.
                  </p>

                  <div className="mt-16">
                    <button
                      onClick={handleReset}
                      className="px-8 py-3.5 border border-gray-300 text-gray-900 text-sm font-medium uppercase tracking-wide rounded-none hover:border-gray-900 active:bg-gray-50 transition-colors duration-250"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-16 text-center">
          <span className="text-xs text-gray-400 tracking-wide">
            A free tool. Not financial advice.
          </span>
        </div>
      </footer>
    </>
  );
}
