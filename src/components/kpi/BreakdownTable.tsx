"use client";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import React from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type {
  BreakdownItem,
  Interval,
  IntervalBreakdown,
  BreakdownData,
  KPIConfig,
  BreakdownHandlers,
  BreakdownSetters,
  BreakdownFlags,
  BreakdownDataProp,
} from "@/types/kpi";
import { Button } from "@/components/ui/button";
import { getCurrentIntervalIndex, getIntervalLabels } from "./KpiConstant";
import { useAuth } from "@/contexts/AuthContext";

interface BreakdownTableProps {
  config: KPIConfig;
  data: BreakdownDataProp;
  handlers: BreakdownHandlers;
  setters: BreakdownSetters;
  flags: BreakdownFlags;
  userCheck?: { isUserEdit: boolean };
}

const BreakdownTable = forwardRef<
  { validateKpiNames: (isSubmitting?: boolean) => boolean },
  BreakdownTableProps
>(function BreakdownTable(
  {
    config,
    handlers,
    setters,
    flags,
    data,
  },
  ref
) {
  const { kpiType, targetValue, divisionType, frequency, quarter, quarterStartDate, quarterEndDate } = config;   
  const { items } = data;
  const { onKpiNameChange, onBreakdownValueChange, onValidationChange } = handlers;
  const { setNewBreakdown, setRemainingContribution } = setters;
  const { isEditMode, isSubmit, isLinked } = flags;
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const previousItems = useRef(items);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [visibleIntervalRange, setVisibleIntervalRange] = useState<[number, number]>([0, 12]);
  const inputRefs = useRef<Record<string, HTMLInputElement>>({});
  const isFirstRender = useRef(true);
  const isInitializing = useRef(false);
  const isValidating = useRef(false);
  const [kpiNameWarnings, setKpiNameWarnings] = useState<Record<string, string>>({});
  const [hasExcessError, setHasExcessError] = useState<boolean>(false);
  const [breakdownData, setBreakdownData] = useState<BreakdownData[]>([]);
  const prevItemsRef = useRef<BreakdownItem[]>([]);
  const [isLoadingIntervals, setIsLoadingIntervals] = useState(true);
  const prevValidationStateRef = useRef<boolean>(false);
  const [kpiNames, setKpiNames] = useState<Record<string, string>>({});
  
  const effectiveIntervalIndex: number = useMemo(() => {
    return Math.max(0, getCurrentIntervalIndex(frequency, quarterStartDate, quarterEndDate));
  }, [frequency, quarter, quarterStartDate, quarterEndDate]);

  const { user: userCheck } = useAuth();
  // console.log(userCheck.isUserEdit);
  

  useEffect(() => {
    if (isSubmit) {
      if (items.length > 0 && (kpiType === "company" || kpiType === "team")) {
        validateKpiNames(isSubmit);
      }
    }
  }, [isSubmit]);

  useEffect(() => {
    if (Array.isArray(items) && items.length > 0) {
      const newIds = new Set(items.map((item) => item?.id));
      const currentIds = new Set(Object.keys(kpiNames));
      if (newIds.size !== currentIds.size || ![...newIds].every((id) => currentIds.has(id))) {
        const newKpiNames: Record<string, string> = {};
        items.forEach((item) => {
          newKpiNames[item?.id] = kpiNames[item?.id] || item?.kpiName || "";
        });
        setKpiNames(newKpiNames);
      }
    }
  }, [items, kpiNames]);

  const getIntervalTarget = useCallback((item: any, index: number) => {
    const localKey = `${item?.id}-interval${index}`;
    const inputRef = inputRefs.current[localKey];

    if (inputRef && inputRef.value) {
      return inputRef.value;
    } else if (localValues[localKey]) {
      return localValues[localKey];
    } else if (item?.weeks[`interval${index}`]) {
      return item?.weeks[`interval${index}`];
    } else {
      return getBreakdownValue(item, index);
    }
  }, [localValues]);

  useEffect(() => {
    const updateBreakdownData = async () => {
      if (items.length > 0 && intervals.length > 0) {
        const newBreakdownData: BreakdownData[] = await Promise.all(
          items.map(async (item) => {
            let decimalSum = 0;
            const intervalBreakDown: IntervalBreakdown[] = await Promise.all(
              intervals.map(async (interval, index) => {
                const intervalTarget = await getIntervalTarget(item, index);
                const intValue = Math.floor(Number(intervalTarget));
                const decimalPart = Number(intervalTarget) - intValue;
                decimalSum += decimalPart;

                const baseData = {
                  intervalIndex: index,
                  intervalName: interval.label,
                  startDate: interval.startDate,
                  endDate: interval.endDate,
                  intervalContribution: 0,
                  intervalTarget: intValue,
                };

                if (isEditMode) {
                  if (
                    Array.isArray(item?.intervalBreakDown) &&
                    item?.intervalBreakDown[index]
                  ) {
                    const isNewItem = !previousItems.current.some(
                      (prevItem) => prevItem?.id === item?.id
                    );
                    if (!isNewItem) {
                      return {
                        ...item.intervalBreakDown[index],
                        intervalTarget: intValue,
                      };
                    }
                  } else {
                    return baseData;
                  }
                }
                return baseData;
              })
            );

            const lastIndex = intervalBreakDown.length - 1;
            if (lastIndex >= 0) {
              intervalBreakDown[lastIndex].intervalTarget = (
                Number(intervalBreakDown[lastIndex].intervalTarget) +
                Math.round(decimalSum)
              );
            }

            const totalValue = intervalBreakDown.reduce(
              (sum, interval) => sum + Number(interval.intervalTarget), 
              0
            );
            const contribution = (
              (totalValue / Number(targetValue)) *
              100
            ).toFixed(0);

            return {
              id: item?.id,
              name: item?.name,
              kpiName: item?.kpiName || "",
              contribution:
                divisionType === "cumulative"
                  ? contribution
                  : "100",
              frequency: frequency,
              intervalBreakDown,
            };
          })
        );
        
        if (JSON.stringify(breakdownData) !== JSON.stringify(newBreakdownData)) {
          setBreakdownData(newBreakdownData); 
          setTimeout(() => {
            setNewBreakdown(newBreakdownData); 
          }, 0);
        }
      }
    };
    updateBreakdownData();
  }, [items, intervals, targetValue, divisionType, frequency, isEditMode]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingIntervals(true);
      try { 
        const intervalLabels = await getIntervalLabels(frequency, quarter, quarterStartDate, quarterEndDate);
        setIntervals(intervalLabels);

        const currentIndex = effectiveIntervalIndex;

        if (frequency === "daily" && intervalLabels.length > 13) {
          const start = Math.max(0, currentIndex - 6);
          const end = Math.min(intervalLabels.length - 1, start + 12);
          setVisibleIntervalRange([start, end]);
        } else {
          setVisibleIntervalRange([0, Math.min(12, intervalLabels.length - 1)]);
        }
      } catch (error) {
        console.error("Error fetching intervals: ", error);
      } finally {
        setIsLoadingIntervals(false);
      }
    };
    fetchData();
  }, [frequency, quarter, quarterStartDate, quarterEndDate]);

  const haveItemsChanged = (
    prevItems: BreakdownItem[],
    currentItems: BreakdownItem[]
  ): boolean => {
    if (prevItems.length !== currentItems.length) return true;

    const prevIds = new Set(prevItems.map((item) => item?.id));
    const currentIds = new Set(currentItems.map((item) => item?.id));

    if (prevIds.size !== currentIds.size) return true;

    for (const id of prevIds) {
      if (!currentIds.has(id)) return true;
    }

    return false;
  };

  useEffect(() => {
    if (isInitializing.current || isLoadingIntervals) return;

    if (Array.isArray(items) && items.length > 0) {
      const itemsChanged = haveItemsChanged(prevItemsRef.current, items);
      prevItemsRef.current = [...items];

      const newLocalValues: Record<string, string> = {};
      let hasEmptyWeeks: boolean;
      items.forEach((item) => {
        if (item?.weeks && Object.entries(item?.weeks).length > 0) {
          Object.entries(item?.weeks).forEach(([key, value]) => {
            newLocalValues[`${item?.id}-${key}`] = Number(value).toFixed(0);
          });
        } else {
          hasEmptyWeeks = true;
        }
      });

      setLocalValues(newLocalValues);

      if (
        itemsChanged && hasEmptyWeeks &&
        intervals.length > 0 &&
        Number(targetValue) > 0
      ) {
        initializeBreakdownValues();
      }
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
    }
  }, [items, intervals, targetValue, quarter]);

  const prevTargetValueRef = useRef(targetValue);
  const prevQuarterRef = useRef(quarter);
  const prevDivisionTypeRef = useRef(divisionType);

  const calculateItemTarget = useCallback((item: BreakdownItem): number => {
    if (divisionType !== "cumulative") {
      return Number(targetValue) || 0;
    }

    const numericTarget = Number(targetValue || '0') || 0;
    const totalContribution = items.reduce((sum, i) => {
      return sum + (Number(i.contribution || "0") || 0);
    }, 0);

    if (totalContribution === 0) {
      return numericTarget / items.length;
    }

    const itemContribution = Number.parseFloat(item.contribution || "0") || 0;
    return numericTarget * (itemContribution / totalContribution);
  }, [divisionType, targetValue, items]);

  const initializeBreakdownValues = () => {
    if (
      !targetValue ||
      Number(targetValue) === 0 ||
      items.length === 0 ||
      intervals.length === 0
    )
      return;

    isInitializing.current = true;
    const numericTarget = Number(targetValue);
    const remainingIntervals = intervals.length - effectiveIntervalIndex;

    if (remainingIntervals > 0) {
      const newLocalValues = { ...localValues };

      items.forEach((item) => {
        let itemTarget = numericTarget;
        let remainingTarget = itemTarget;

        if (divisionType === "cumulative") {
          itemTarget = calculateItemTarget(item);
          remainingTarget = itemTarget;
          if (isEditMode) {
            let previousSum = 0;
            for (let i = 0; i < effectiveIntervalIndex; i++) {
              const localKey = `${item?.id}-interval${i}`;
              const existingValue = parseFloat(newLocalValues[localKey]) || 0;
              previousSum += existingValue;
            }
            remainingTarget = itemTarget - previousSum;
          }
        }
        
        let decimalAccumulator = 0;
        for (let i = effectiveIntervalIndex; i < intervals.length; i++) {
          let newValue;

          if (divisionType === "standalone") {
            newValue = numericTarget.toFixed(2);
          } else {
            const valuePerInterval = remainingTarget / remainingIntervals;
            newValue = valuePerInterval.toFixed(2);
          }
          
          const intValue = Math.floor(Number(newValue));
          const decimalPart = Number(newValue) - intValue;
          decimalAccumulator += decimalPart;
          let finalValue = intValue;

          if (i === intervals.length - 1) {
            finalValue += Math.round(decimalAccumulator);
          }

          const localKey = `${item?.id}-interval${i}`;
          const finalValueFixed = finalValue.toFixed(0);
          newLocalValues[localKey] = finalValueFixed.toString();

          const inputRef = inputRefs.current[localKey];
          if (inputRef) {
            inputRef.value = finalValueFixed.toString();
          }

          onBreakdownValueChange?.(item?.id, i, finalValueFixed);
        }
      });

      setLocalValues(newLocalValues);

      setTimeout(() => {
        validateCumulativeValues();
        isInitializing.current = false;
      }, 0);
    } else {
      isInitializing.current = false;
    }
  };

  useEffect(() => {
    if (isFirstRender.current) return;

    const targetChanged = prevTargetValueRef.current !== targetValue;
    const divisionTypeChanged = prevDivisionTypeRef.current !== divisionType;
    const quarterChanged = prevQuarterRef.current !== quarter;

    if (!targetChanged && !divisionTypeChanged && !quarterChanged) return;

    prevTargetValueRef.current = targetValue;
    prevDivisionTypeRef.current = divisionType;
    prevQuarterRef.current = quarter;

    if (!targetValue || Number(targetValue) === 0) return;

    initializeBreakdownValues();
  }, [targetValue, divisionType, items, intervals, onBreakdownValueChange, quarter]);

  useEffect(() => {
    if (isInitializing.current || isValidating.current) return;

    if (divisionType === "cumulative" && items.length > 0) {
      validateCumulativeValues();
    } else {
      if (validationWarning !== null) setValidationWarning(null);
      if (hasExcessError) setHasExcessError(false);
      updateValidationState();
    }
  }, [items, divisionType, targetValue, localValues]);

  const getBreakdownValue = useCallback((
  item: BreakdownItem,
  intervalIndex: number
): string => {
  const localKey = `${item?.id}-interval${intervalIndex}`;
  
  // First check for existing values
  if (item?.weeks?.[`interval${intervalIndex}`]) {
    return item.weeks[`interval${intervalIndex}`];
  }
  if (localValues[localKey]) {
    return localValues[localKey];
  }

  // For standalone KPIs
  if (divisionType === "standalone") {
    // For past intervals
    if (intervalIndex < effectiveIntervalIndex) {
      return userCheck?.isUserEdit ? (Number(targetValue) || 0).toFixed(0) : "0";
    }
    // For current/future intervals
    return (Number(targetValue) || 0).toFixed(0);
  }

  // Default case for non-standalone KPIs
  return "0";
}, [localValues, targetValue, effectiveIntervalIndex, divisionType, userCheck?.isUserEdit]);

  const updateValidationState = () => {
    const hasEmptyKpiNames =
      (kpiType === "company" || kpiType === "team") &&
      items.some((item) => {
        const kpiName = item?.kpiName || "";
        return !kpiName.trim();
      });

    const currentValidationState = hasEmptyKpiNames || hasExcessError;

    if (
      onValidationChange &&
      prevValidationStateRef.current !== currentValidationState
    ) {
      prevValidationStateRef.current = currentValidationState;
      onValidationChange(currentValidationState);
    }
  };

  const validateCumulativeValues = useCallback(() => {
    if (isValidating.current) return false;
    isValidating.current = true;
    try {
      if (!targetValue || Number(targetValue) === 0) {
        if (validationWarning !== null) setValidationWarning(null);
        if (hasExcessError) setHasExcessError(false);
        updateValidationState();
        return false;
      }
  
      if (items.length === 0) {
        if (validationWarning !== null) setValidationWarning(null);
        if (hasExcessError) setHasExcessError(false);
        updateValidationState();
        return false;
      }
  
      let foundExcessError = false;
      let warningMessage = null;
  
      let totalTarget = Number(targetValue);
      let totalSum = 0;
      let breakdownItems: any[];
      
      if (isEditMode) {
        breakdownItems = items;
      } else {
        breakdownItems = breakdownData;
      }

      for (const item of breakdownItems) {
        let itemTarget = 0;
        for (let i = 0; i < intervals.length; i++) {
          const localKey = `${item?.id}-interval${i}`;
          const inputRef = inputRefs.current[localKey];
  
          let valueStr = "0";
          if (inputRef) {
            valueStr = inputRef.value || "0";
          } else {
            valueStr = localValues[localKey] || (item?.weeks ? item.weeks[`interval${i}`] : "0") || "0";
          }
  
          itemTarget += Number.parseFloat(valueStr);
        }
  
        let sum = 0;
        for (let i = Math.max(0, effectiveIntervalIndex); i < intervals.length; i++) {
          const localKey = `${item?.id}-interval${i}`;
          const inputRef = inputRefs.current[localKey];
  
          let valueStr = "0";
          if (inputRef) {
            valueStr = inputRef.value || "0";
          } else {
            valueStr = localValues[localKey] || (item?.weeks ? item.weeks[`interval${i}`] : "0") || "0";
          }
          const value = Number.parseFloat(valueStr);
  
          if (!isNaN(value)) {
            sum += value;
          }
        }
        totalSum += itemTarget;
      }
  
      const targetFixed = Number(totalTarget.toFixed(2));
      const sumFixed = Number(totalSum.toFixed(2));
      const remaining = targetFixed - sumFixed;
      const remainingPercentage = parseFloat(((remaining / targetFixed) * 100).toFixed(0));
      setRemainingContribution(remainingPercentage);

      if (sumFixed > targetFixed + 0.5) {
        const difference = (sumFixed - targetFixed).toFixed(2);
        warningMessage = `The total sum of all items (${sumFixed.toFixed(2)}) exceeds the total target (${Number(targetFixed).toFixed(2)}). Excess: ${difference}`;
        foundExcessError = true;
      } else if (sumFixed < targetFixed - 0.5) {
        const targetFixed = Number(totalTarget.toFixed(2));
        const remaining = targetFixed - sumFixed;
        const remainingPercentage = parseFloat(((remaining / targetFixed) * 100).toFixed(0));
        setRemainingContribution(remainingPercentage);
        if (remaining >= 1) {
          const difference = remaining.toFixed(2);
          warningMessage = `The total sum of all items (${sumFixed.toFixed(2)}) is less than the total target (${Number(targetFixed).toFixed(2)}). Remaining: ${difference}`;
        }
      }
  
      if (validationWarning !== warningMessage) {
        setValidationWarning(warningMessage);
      }
  
      if (hasExcessError !== foundExcessError) {
        setHasExcessError(foundExcessError);
      }
  
      updateValidationState();
  
      return !foundExcessError;
    } finally {
      isValidating.current = false;
    }
  }, [targetValue, items, divisionType, intervals]);
  
  const validateKpiNames = (isSubmitting = true) => {
    if (kpiType === "individual") {
      if (Object.keys(kpiNameWarnings).length > 0) {
        setKpiNameWarnings({});
      }
      updateValidationState();
      return false;
    }

    const newWarnings: Record<string, string> = {};
    let hasEmptyKpiNames = false;
    let hasTooShortKpiNames = false;

    items.forEach((item) => {
      const kpiName = item?.kpiName || "";
      if (!kpiName.trim()) {
        newWarnings[item?.id] = "KPI name is required";
        hasEmptyKpiNames = true;
      } else if (kpiName.trim().length < 3) {
        newWarnings[item?.id] = "KPI name must be at least 3 characters";
        hasTooShortKpiNames = true;
      }
    });

    if (isSubmitting) {
      if (JSON.stringify(kpiNameWarnings) !== JSON.stringify(newWarnings)) {
        setKpiNameWarnings(newWarnings);
      }
    } else {
      setKpiNameWarnings({});
    }

    updateValidationState();

    return hasEmptyKpiNames || hasTooShortKpiNames;
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;

    const value = input.value;
    const numericValue = value.replace(/[^0-9.]/g, "");

    if (value !== numericValue) {
      input.value = numericValue;
      if (cursorPosition !== null) {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
  };

  const handleBlur = useCallback((
    itemId: string,
    intervalIndex: number,
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const input = e.target;
    const value = input.value;
    const localKey = `${itemId}-interval${intervalIndex}`;

    const numericValue = Number.parseFloat(value) || 0;
    const formattedValue = numericValue.toFixed(0);

    input.value = formattedValue;

    setLocalValues((prev) => ({
      ...prev,
      [localKey]: formattedValue,
    }));

    onBreakdownValueChange?.(itemId, intervalIndex, formattedValue);

    setTimeout(validateCumulativeValues, 0);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) return;

    if (
      divisionType === "cumulative" &&
      Number(targetValue) > 0 &&
      intervals.length > 0 &&
      items.length > 0 && 
      !isEditMode
    ) {
      isInitializing.current = true;

      const remainingIntervals = intervals.length - effectiveIntervalIndex;

      if (remainingIntervals > 0) {
        let needsInitialization = true;

        for (const item of items) {
          for (let i = effectiveIntervalIndex; i < intervals.length; i++) {
            const localKey = `${item?.id}-interval${i}`;
            const inputRef = inputRefs.current[localKey];

            if (inputRef && Number.parseFloat(inputRef.value || "0") > 0) {
              needsInitialization = false;
              break;
            }
          }
          if (!needsInitialization) break;
        }

        if (needsInitialization) {
          const newLocalValues = { ...localValues };

          items.forEach((item) => {
            const itemTarget = calculateItemTarget(item);
            const valuePerInterval = itemTarget / remainingIntervals;
            let decimalAccumulator = 0;
            for (let i = effectiveIntervalIndex; i < intervals.length; i++) {
              const newValue = valuePerInterval.toFixed(2);
              const localKey = `${item?.id}-interval${i}`;
              const intValue = Math.floor(Number(newValue));
              const decimalPart = Number(newValue) - intValue;
              decimalAccumulator += decimalPart;
              let finalValue = intValue;

              if (i === intervals.length - 1) {
                finalValue += Math.round(decimalAccumulator);
              }
              const finalValueFixed = finalValue.toFixed(0);
              newLocalValues[localKey] = finalValueFixed.toString();

              const inputRef = inputRefs.current[localKey];
              if (inputRef) {
                inputRef.value = finalValueFixed;
              }

              onBreakdownValueChange?.(item?.id, i, finalValueFixed);
            }
          });

          setLocalValues(newLocalValues);
        }
      }

      setTimeout(() => {
        isInitializing.current = false;
        validateCumulativeValues();
      }, 0);
    }
  }, [
    divisionType,
    targetValue,
    intervals,
    items,
    effectiveIntervalIndex,
    onBreakdownValueChange,
  ]);

  useEffect(() => {
    if (isInitializing.current || isValidating.current) return;

    if (items.length > 0 && (kpiType === "company" || kpiType === "team")) {
      // Only validate without showing warnings during normal operation
    } else {
      setKpiNameWarnings({});

      const currentValidationState = hasExcessError;
      if (
        onValidationChange &&
        prevValidationStateRef.current !== currentValidationState
      ) {
        prevValidationStateRef.current = currentValidationState;
        onValidationChange(currentValidationState);
      }
    }
  }, [items, kpiType, hasExcessError]);

  const showPreviousIntervals = () => {
    setVisibleIntervalRange(([start]) => {
      const newStart = Math.max(0, start - 13);
      return [newStart, newStart + 12];
    });
  };

  const handleKpiNameChange = useCallback((id: string, value: string) => {
    setKpiNames((prev) => ({
      ...prev,
      [id]: value,
    }));

    items.map((item) => {
      if (item?.id === id) {
        return {
          ...item,
          kpiName: value,
        };
      }
      return item;
    });

    onKpiNameChange?.(id, value);

    if (kpiNameWarnings[id]) {
      const newWarnings = { ...kpiNameWarnings };
      delete newWarnings[id];
      setKpiNameWarnings(newWarnings);
    }
  }, [onKpiNameChange, kpiNameWarnings]);

  const showNextIntervals = () => {
    setVisibleIntervalRange(([start]) => {
      const newStart = Math.min(intervals.length - 13, start + 13);
      return [newStart, Math.min(intervals.length - 1, newStart + 12)];
    });
  };

  const safeIntervals = intervals || [];
  const visibleIntervals = useMemo(() => {
    return safeIntervals.slice(visibleIntervalRange[0], visibleIntervalRange[1] + 1);
  }, [safeIntervals, visibleIntervalRange]);

  const paginationInfo = useMemo(() => {
    return intervals.length > 13
      ? `Showing ${visibleIntervalRange[0] + 1}-${visibleIntervalRange[1] + 1} of ${intervals.length} intervals`
      : null;
  }, [visibleIntervalRange, intervals.length]);

  useImperativeHandle(ref, () => ({
    validateKpiNames: (isSubmitting = true) => validateKpiNames(isSubmitting),
    hasExcessError: () => hasExcessError,
  }));

  return (
    <div className="space-y-2">
      {validationWarning && (
        <Alert
          className={
            hasExcessError
              ? "bg-red-50 border-red-200"
              : validationWarning
              ? "bg-amber-50 border-amber-200"
              : ""
          }
        >
          <AlertTriangle
            className={`h-4 w-4 ${
              hasExcessError ? "text-red-600" : "text-amber-600"
            }`}
          />
          <AlertDescription
            className={hasExcessError ? "text-red-700" : "text-amber-700"}
          >
            {validationWarning && <p>{validationWarning}</p>}
          </AlertDescription>
        </Alert>
      )}

      {intervals.length > 13 && (
        <div className="flex justify-between items-center mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={showPreviousIntervals}
            disabled={visibleIntervalRange[0] === 0}
          >
            Previous
          </Button>
          <span className="text-xs text-gray-500">{paginationInfo}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={showNextIntervals}
            disabled={visibleIntervalRange[1] >= intervals.length - 1}
          >
            Next
          </Button>
        </div>
      )}

      <div className="w-full min-w-[800px] border rounded-md overflow-x-auto max-h-56 overflow-auto">
        <table className="text-sm mb-3">
          <thead>
            <tr className="bg-muted/50">
              {(kpiType === "company" || kpiType === "team") && (
                <th className="p-2 font-medium text-xs min-w-[150px] bg-muted/50 z-10 text-center">
                  {kpiType === "company" ? "Team" : "Member Name"}
                </th>
              )}
              <th className="text-center p-2 font-medium text-xs min-w-[180px] bg-muted/50 z-10">
                {kpiType === "individual" ? "Employee's Name" : "KPI Name"}
              </th>
              <th className="text-center p-2 font-medium text-xs min-w-[100px] bg-muted/50 z-10">
                Contribution
              </th>
              {visibleIntervals.map((interval, i) => {
                const actualIndex = i + visibleIntervalRange[0];
                return (
                  <th
                    key={`${interval}-${actualIndex}`}
                    className={`text-center p-2 font-medium text-xs min-w-[100px] ${
                      (actualIndex < effectiveIntervalIndex) && !userCheck?.isUserEdit ? "text-gray-400" : "text-black"
                    }`}
                  >
                    {interval.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(items) &&
              items.length > 0 &&
              items?.map((item) => {
                const itemBreakdown = breakdownData.find(
                  (bd) => bd.id === item?.id
                );
                const contribution = itemBreakdown?.contribution || "0.00";
                return (
                  <tr key={item?.id}>
                    {(kpiType === "company" || kpiType === "team") && (
                      <td className="p-2 border-t text-xs whitespace-nowrap bg-[#ffffff] text-center z-10">
                        {item?.name || ""}
                      </td>
                    )}
                    <td className="p-2 border-t bg-[#ffffff] z-10 text-center">
                      {kpiType === "individual" ? (
                        <span className="text-xs">{item?.name}</span>
                      ) : (
                        <div className="space-y-1">
                          <Input
                            className={`h-7 w-full text-xs ${
                              kpiNameWarnings[item?.id] ? "border-red-500" : ""
                            }`}
                            placeholder="Enter KPI name"
                            value={kpiNames[item?.id] || ""}
                            onChange={(e) =>
                              handleKpiNameChange(item?.id, e.target.value)
                            }
                          />
                          {kpiNameWarnings[item?.id] && (
                            <p className="text-red-500 text-xs mt-1">
                              {kpiNameWarnings[item?.id]}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-2 border-t text-xs whitespace-nowrap text-center bg-[#ffffff] z-10">
                      {parseFloat(contribution) >= 99 &&
                      parseFloat(contribution) < 101
                        ? "100%"
                        : `${parseFloat(contribution).toFixed(2)}%`}
                    </td>

                    {visibleIntervals.map((interval, i) => {
                      const actualIndex = i + visibleIntervalRange[0];
                      const localKey = `${item?.id}-interval${actualIndex}`;
                      const displayValue = getBreakdownValue(item, actualIndex);
                      
                      // Always disable for standalone KPIs
                      // For non-standalone, disable past intervals if user doesn't have edit permission
                      const shouldDisableInput = 
                      divisionType === "standalone" || 
                          (actualIndex < effectiveIntervalIndex && !userCheck?.isUserEdit) ||
                          isLinked;
                          // console.log(shouldDisableInput);                  
                      return (
                        <td
                          key={`${item?.id}-${interval}-${actualIndex}`}
                          className="p-2 border-t text-xs text-center"
                        >
                          {shouldDisableInput ? (
                            <span className={actualIndex < effectiveIntervalIndex ? "text-gray-400" : ""}>
                              {Math.round(Number(displayValue))}
                            </span>
                          ) : (
                            <Input
                              ref={(el) => {
                                if (el) inputRefs.current[localKey] = el;
                              }}
                              className="h-7 w-full text-xs text-center"
                              defaultValue={Number(displayValue).toFixed(0)}
                              onInput={handleInput}
                              onBlur={(e) => handleBlur(item?.id, actualIndex, e)}
                              disabled={shouldDisableInput}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default React.memo(BreakdownTable);
