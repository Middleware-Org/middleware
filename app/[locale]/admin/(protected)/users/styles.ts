import { cn } from "@/lib/utils/classes";

import { entityCrudStyles } from "../shared/entityCrudStyles";

const styles = {
  ...entityCrudStyles,
  passwordError: cn("mt-2 text-sm text-red-500"),
};

export default styles;
