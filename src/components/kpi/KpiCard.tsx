"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface KpiCardProps {
  kpi: any;
}

export function KpiCard({ kpi }: KpiCardProps) {
  const progressPercentage =
    kpi.qtdGoal > 0
      ? Math.min(Math.round((kpi.qtdAchieved / kpi.qtdGoal) * 100), 100)
      : 0;

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "individual":
        return "bg-blue-500 hover:bg-blue-600";
      case "team":
        return "bg-green-500 hover:bg-green-600";
      case "company":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Link to={`/kpi/${kpi.id}`}>
      <Card className="bg-[#111111] border-gray-800 hover:border-gray-700 transition-all cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className={`${getBadgeColor(kpi.kpiType)} text-white`}>
              {kpi.kpiType.charAt(0).toUpperCase() + kpi.kpiType.slice(1)}
            </Badge>
            <ArrowUpRight className="h-4 w-4 text-gray-400" />
          </div>
          <CardTitle className="text-white text-lg mt-2">{kpi.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-400">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Owner:</span>
              <span className="text-white">{kpi.owner}</span>
            </div>
            <div className="flex justify-between">
              <span>Quarter:</span>
              <span className="text-white">{kpi.quarter}</span>
            </div>
            {kpi.team && (
              <div className="flex justify-between">
                <span>Team:</span>
                <span className="text-white">{kpi.team}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Goal:</span>
              <span className="text-white">{kpi.quarterlyGoal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Progress:</span>
              <span className="text-white">{progressPercentage}%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{kpi.qtdAchieved.toFixed(2)}</span>
              <span>{kpi.qtdGoal.toFixed(2)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
