
import { ProductForm } from "@/app/(dashboard)/[storeId]/(routes)/products/[productId]/components/product-form"
import { useCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { ComponentType } from "react"

// Define the roles and their permissions
const rolePermissions = {
  Administrator: ["create", "read", "update", "delete"],
  Acctg: ["create", "read", "update"],
  User: ["read"]
}

type Permission = "create" | "read" | "update" | "delete"

export function withRoleCheck<T extends object>(
  WrappedComponent: ComponentType<T>,
  requiredPermissions: Permission[]
) {
  return function WithRoleCheck(props: T) {
    const user = useCurrentUser();
    const router = useRouter()

    if (status === "loading") {
      return <div>Loading...</div>
    }

    if (!user) {
      router.push("/auth/sign-in")
      return null
    }

    const userRole = user.role as keyof typeof rolePermissions
    const userPermissions = rolePermissions[userRole] || []

    const hasRequiredPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    )

    if (!hasRequiredPermissions) {
      return <div>You do not have permission to access this page.</div>
    }

    return <WrappedComponent {...props} />
  }
}

// Usage example
export const ProductFormWithRoleCheck = withRoleCheck(ProductForm, ["create", "update", "delete"])