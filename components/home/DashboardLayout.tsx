import { Grid, GridItem } from "@/components/ui/grid";
import { BadgeCent, TrendingUp, UserStar ,BriefcaseBusiness} from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import DashboardCard from "./DashboardCard";
import EarningsCard from "./EarningsCard";

type DashboardStats ={
    earnings:number;
    active:number;
    rating:number;
    completedJobs:number;
}

export default function DashboardLayout({earnings, active, rating, completedJobs}: DashboardStats) {
  return (
    <View className="">
      <Grid className="gap-4" _extra={{ className: "grid-cols-12" }}>
        <GridItem _extra={{ className: "col-span-12" }}>
          <EarningsCard
            icon={<BadgeCent color={"#6b7280"} size={16} />}
            statsValue={earnings}
            title="Total Earnings"
          />
        </GridItem>
        <GridItem _extra={{ className: "col-span-5" }}>
          <DashboardCard
            icon={<TrendingUp color={"#6b7280"} size={15} />}
            statsValue={active}
            title="Active jobs"
          />
        </GridItem>
        <GridItem _extra={{ className: "col-span-3" }}>
          <DashboardCard
            icon={<UserStar color={"#6b7280"} size={15} />}
            statsValue={rating}
            title="Rating"
          />
        </GridItem>
        <GridItem _extra={{ className: "col-span-4" }}>
          <DashboardCard
            icon={<BriefcaseBusiness color={"#6b7280"} size={15} />}
            statsValue={completedJobs}
            title="Jobs Done"
          />
        </GridItem>
      </Grid>
    </View>
  );
}
